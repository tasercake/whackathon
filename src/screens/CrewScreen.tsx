import { Mascot, Plus, Shield } from '../components/art';
import { useStore } from '../store/store';
import type { Grant } from '../types';

function GrantRow({
  grant,
  index,
  onRevoke,
  onTogglePause,
}: {
  grant: Grant;
  index: number;
  onRevoke: (g: Grant) => void;
  onTogglePause: (g: Grant) => void;
}) {
  const avatarTone = grant.paused
    ? 'avatar--off'
    : index % 2 === 0
      ? ''
      : 'avatar--ink';

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
            : `${grant.used} of ${grant.allowance} this week`}
        </button>
      </div>
      <div className="lane--action">
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

      <section className="grants">
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
            onRevoke={onRevoke}
            onTogglePause={(g) => dispatch({ type: 'togglePause', id: g.id })}
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
            Nobody gets a notification when you take their switch away. No grace period,
            no appeal, no awkward conversation. Every zap they send is signed, and you can
            dispute any of them.
          </p>
        </div>
      </aside>
    </>
  );
}
