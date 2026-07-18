import { Mascot, Plus } from '../components/art';
import { useStore } from '../store/store';
import { LEVEL_WORDS } from '../components/IntensityLadder';
import type { Goal } from '../types';

const TRACKER_NOTE: Record<Goal['tracker'], string> = {
  band: 'The band logs it. Close the app and nothing happens — that’s the whole trick.',
  checkin: 'Mark it done by 9pm. Buzz takes your word for it.',
  witness: 'Someone in your crew vouches. They can’t zap, only confirm.',
};

const TRIGGER_NOTE: Record<Goal['trigger'], string> = {
  weekly: 'One zap, Sunday 9pm, only if you missed the week.',
  immediate: 'Fires the moment you slip. Every time.',
};

const DAY = 86_400_000;

function daysLive(goal: Goal): number {
  return Math.floor((Date.now() - goal.createdAt) / DAY) + 1;
}

export function GoalsScreen({
  onNewGoal,
  onEditPermissions,
}: {
  onNewGoal: () => void;
  onEditPermissions: () => void;
}) {
  const { state } = useStore();
  const { goals, grants } = state;
  const hasGoals = goals.length > 0;

  return (
    <>
      <section className="hero">
        <div className="hero__col">
          <div>
            <span className="eyebrow">
              {hasGoals
                ? `DAY ${Math.max(...goals.map(daysLive))} · STREAK ALIVE`
                : 'NOTHING IS WATCHING YOU YET'}
            </span>
          </div>
          <h1 className="display">
            {hasGoals ? (
              <>
                Nice one.
                <br />
                You didn’t
                <br />
                get zapped.
              </>
            ) : (
              <>
                No rules yet.
                <br />
                Nothing to
                <br />
                live up to.
              </>
            )}
          </h1>
          <p className="lede">
            {hasGoals
              ? `${goals.length} ${goals.length === 1 ? 'goal' : 'goals'} held. Your crew’s watching — and they’re rooting for you, mostly.`
              : 'Write a rule in your own words, pick how hard it stings, and Buzz holds you to it. Nothing fires until you say so.'}
          </p>
          <div className="hero__actions">
            <button className="btn btn--chrome" onClick={onNewGoal}>
              <Plus />
              New goal
            </button>
            <span className="hero__aside">You write the rule. You pick the sting.</span>
          </div>
        </div>
        <div className="mascot">
          <Mascot />
        </div>
      </section>

      {hasGoals && (
        <section className="cards">
          {goals.slice(0, 3).map((goal) => (
            <article key={goal.id} className="card">
              <div className="card__top">
                <div className="card__name">{goal.rule}</div>
                <div className="card__badge">LEVEL {goal.ceiling}</div>
              </div>
              {/* The only number we honestly have until the band reports in. */}
              <div className="card__figure">Day {daysLive(goal)}</div>
              <div className="card__foot">{TRACKER_NOTE[goal.tracker]}</div>
              <div className="card__foot" style={{ marginTop: 'auto' }}>
                {TRIGGER_NOTE[goal.trigger]} Ceiling: {LEVEL_WORDS[goal.ceiling]}.
              </div>
            </article>
          ))}
        </section>
      )}

      <section className="crew-strip">
        <div className="crew-strip__label">Your crew</div>
        <div className="crew-strip__stack">
          {grants.length === 0 ? (
            <div className="avatar avatar--36 avatar--off">0</div>
          ) : (
            grants.slice(0, 4).map((g, i) => (
              <div
                key={g.id}
                className={`avatar avatar--36${i === 0 ? '' : ' avatar--ink'}${
                  g.paused ? ' avatar--off' : ''
                }`}
              >
                {g.name[0]?.toUpperCase()}
              </div>
            ))
          )}
        </div>
        <p className="crew-strip__copy">
          They can zap you. You set the limits, and you can pull the plug on anyone, any
          time, no explanation.
        </p>
        <button className="btn btn--outline-sm" onClick={onEditPermissions}>
          Edit permissions
        </button>
      </section>
    </>
  );
}
