import { useRef, useState } from 'react';
import { Mascot, Plus, Shield } from '../components/art';
import { clampToCap, uid, useStore } from '../store/store';
import { sendShock } from '../services/shockService';
import { chargesLeft, chargesUsed } from '../lib/week';
import type { Grant, Level } from '../types';

/** The simulate-a-zap control exists so the send path can be exercised without
 *  a device. It is not part of either designed flow and never ships. */
const DEV = import.meta.env.DEV;

function GrantRow({
  grant,
  index,
  cap,
  onRevoke,
  onTogglePause,
  onSimulate,
}: {
  grant: Grant;
  index: number;
  cap: Level;
  onRevoke: (g: Grant) => void;
  onTogglePause: (g: Grant) => void;
  onSimulate: (g: Grant) => Promise<void>;
}) {
  const [sending, setSending] = useState(false);
  // `sending` disables the button, but only after a render. Clicks landing in
  // the same tick would all get past it and spend the same charge twice, so
  // the gate that actually holds is this ref, set before the first await.
  const inFlight = useRef(false);
  const avatarTone = grant.paused
    ? 'avatar--off'
    : index % 2 === 0
      ? ''
      : 'avatar--ink';

  const now = Date.now();
  const used = chargesUsed(grant, now);
  const left = chargesLeft(grant, now);
  // A paused grant keeps its sentence but can't fire, and a spent one waits
  // for Monday. Both are the same "no" to the send path.
  const canFire = !grant.paused && left > 0;

  return (
    <div className="grant">
      <div className="lane--avatar">
        <div className={`avatar avatar--52 ${avatarTone}`}>
          {grant.name[0]?.toUpperCase()}
        </div>
      </div>
      <div className="grant__text">
        <div className="grant__name">{grant.name}</div>
        {/* The sentence is the grant. It's all the grantee ever sees. */}
        <div className="grant__sentence">{grant.sentence}</div>
      </div>
      <div className="lane--ceiling">
        <div className="grant__ceiling">Level {grant.ceiling}</div>
      </div>
      <div className="lane--used">
        <button
          className={`grant__used${grant.paused ? ' grant__used--paused' : ''}`}
          onClick={() => onTogglePause(grant)}
          title={grant.paused ? 'Resume this grant' : 'Pause this grant'}
        >
          {grant.paused
            ? 'Paused by you'
            : `${used} of ${grant.allowance} this week`}
        </button>
      </div>
      <div className="lane--action">
        {DEV && (
          <button
            className="btn btn--dev"
            disabled={!canFire || sending}
            title={
              grant.paused
                ? 'Paused — this grant cannot fire'
                : left === 0
                  ? 'Out of charges until Monday'
                  : `Simulate a level ${clampToCap(grant.ceiling, cap)} zap from ${grant.name}`
            }
            onClick={async () => {
              if (inFlight.current) return;
              inFlight.current = true;
              setSending(true);
              try {
                await onSimulate(grant);
              } finally {
                inFlight.current = false;
                setSending(false);
              }
            }}
          >
            {sending ? 'Zapping…' : 'Zap'}
          </button>
        )}
        <button className="btn btn--hairline" onClick={() => onRevoke(grant)}>
          Revoke
        </button>
      </div>
    </div>
  );
}

export function CrewScreen({
  onTrustSomeone,
  onRevoke,
}: {
  onTrustSomeone: () => void;
  onRevoke: (g: Grant) => void;
}) {
  const { state, dispatch } = useStore();
  const { grants } = state;
  const cap = state.settings.intensityCap;

  /** Dev only. Walks the real send path: clamp → service → signed record →
   *  the `used` counter. The only stubbed part is the service body itself. */
  async function simulate(grant: Grant) {
    // The service clamps again, but the caller owes it a level that is already
    // under the ceiling — a grant's own ceiling, and the user's cap above it.
    const level = clampToCap(grant.ceiling, cap);
    const result = await sendShock({
      grantId: grant.id,
      goalId: null,
      from: grant.name,
      level,
      note: 'Simulated from the dev control.',
    });
    if (!result.ok) {
      console.warn('[buzz] send refused:', result.refusedReason ?? 'no reason given');
      return;
    }
    dispatch({
      type: 'recordShock',
      shock: {
        id: uid('zap'),
        grantId: grant.id,
        goalId: null,
        from: grant.name,
        level,
        note: 'Simulated from the dev control.',
        // The signature comes back from the service. It's what makes the
        // record disputable rather than just a log line.
        signature: result.signature,
        disputed: false,
        at: result.at,
      },
    });
  }

  if (grants.length === 0) {
    return (
      <section className="crew-empty">
        <div className="crew-empty__col">
          <div>
            <span className="eyebrow eyebrow--quiet">NOBODY CAN REACH YOU YET</span>
          </div>
          <h1 className="display display--crew">
            Your crew is
            <br />
            empty, and
            <br />
            that’s fine.
          </h1>
          <p className="lede crew-empty__lede">
            Some people do better when someone they trust can reach across and remind
            them. Some don’t. You don’t owe anyone a spot on this list.
          </p>
          <div className="hero__actions" style={{ paddingTop: 6 }}>
            <button className="btn btn--chrome btn--chrome-lg" onClick={onTrustSomeone}>
              <Plus />
              Trust someone
            </button>
            <button className="btn btn--ghost" style={{ color: 'var(--ink)' }}>
              How this works first
            </button>
          </div>
        </div>
        <div className="mascot mascot--quiet">
          <Mascot />
        </div>
      </section>
    );
  }

  const live = grants.filter((g) => !g.paused);

  return (
    <>
      <section className="crew-head">
        <div className="crew-head__col">
          <div>
            <span className="eyebrow eyebrow--chrome">
              {/* Name someone who can actually reach you, not just the first row. */}
              {live.length > 0
                ? `${live[0].name.toUpperCase()} CAN REACH YOU NOW`
                : 'EVERY SWITCH IS PAUSED'}
            </span>
          </div>
          <h1 className="display display--list">
            {grants.length} {grants.length === 1 ? 'person holds' : 'people hold'}
            <br />a switch.
          </h1>
        </div>
        <button className="btn btn--outline" onClick={onTrustSomeone}>
          <Plus />
          Trust someone
        </button>
      </section>

      <section className={`grants${DEV ? ' grants--dev' : ''}`}>
        <div className="grants__head">
          <div className="lane--avatar" />
          <div className="grants__head-key" style={{ flex: 1 }}>
            WHAT YOU LET THEM DO
          </div>
          <div className="lane--ceiling">
            <div className="grants__head-key">CEILING</div>
          </div>
          <div className="lane--used">
            <div className="grants__head-key">USED</div>
          </div>
          <div className="lane--action" />
        </div>
        {grants.map((grant, i) => (
          <GrantRow
            key={grant.id}
            grant={grant}
            index={i}
            cap={cap}
            onRevoke={onRevoke}
            onTogglePause={(g) => dispatch({ type: 'togglePause', id: g.id })}
            onSimulate={simulate}
          />
        ))}
      </section>

      <aside className="footnote">
        <div className="footnote__icon">
          <Shield size={18} width={1.8} />
        </div>
        <div className="footnote__text">
          <div className="footnote__title">Revoking is instant, and silent.</div>
          <p className="footnote__body">
            {/* No inbox to dispute from yet, so this promises the signing and
                nothing past it. Restore the dispute half when there's a UI. */}
            Nobody gets a notification when you take their switch away. No grace period,
            no appeal, no awkward conversation. Every zap they send is signed, so there’s
            always a record of who sent what.
          </p>
        </div>
      </aside>
    </>
  );
}
