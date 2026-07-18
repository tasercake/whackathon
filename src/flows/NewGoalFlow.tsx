import { useState, type ComponentType } from 'react';
import { Modal } from '../components/Modal';
import { IntensityLadder, LEVEL_WORDS } from '../components/IntensityLadder';
import { Arrow, BandIcon, CheckIcon, Mascot, Shield, WitnessIcon } from '../components/art';
import { uid, useStore } from '../store/store';
import { MAX_LEVEL, type Goal, type Level, type Tracker, type Trigger } from '../types';

const TRACKERS: { id: Tracker; name: string; desc: string; icon: ComponentType }[] = [
  {
    id: 'band',
    name: 'The band',
    desc: 'Motion sensor logs the session. No screenshots, no honor system.',
    icon: BandIcon,
  },
  {
    id: 'checkin',
    name: 'You check in',
    desc: 'Mark it done by 9pm. Miss the mark and it counts as a slip.',
    icon: CheckIcon,
  },
  {
    id: 'witness',
    name: 'A witness',
    desc: "One person from your crew confirms. They can't zap, only vouch.",
    icon: WitnessIcon,
  },
];

const TRACKER_SUMMARY: Record<Tracker, string> = {
  band: 'The band — motion sensor logs the session',
  checkin: 'You check in — mark it done by 9pm',
  witness: 'A witness — one person from your crew confirms',
};

const TRIGGER_SUMMARY: Record<Trigger, string> = {
  weekly: 'Sundays at 9pm, only if you missed the week',
  immediate: 'The moment you slip, every time',
};

type Step = 1 | 2 | 3;

export function NewGoalFlow({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useStore();
  const [step, setStep] = useState<Step>(1);
  const [rule, setRule] = useState('');
  const [tracker, setTracker] = useState<Tracker>('band');
  const [ceiling, setCeiling] = useState<Level>(state.settings.intensityCap);
  const [trigger, setTrigger] = useState<Trigger>('weekly');
  const [created, setCreated] = useState<Goal | null>(null);

  function create() {
    const goal: Goal = {
      id: uid('goal'),
      rule: rule.trim(),
      tracker,
      trigger,
      ceiling,
      createdAt: Date.now(),
    };
    // The ladder on this screen is the only place the cap can move.
    dispatch({ type: 'setCap', cap: ceiling });
    dispatch({ type: 'addGoal', goal });
    setCreated(goal);
    setStep(3);
  }

  if (step === 3 && created) {
    return (
      <Modal onDismiss={onClose} labelledBy="goal-confirmed">
        <div className="confirm-head">
          <div className="confirm-head__seal">
            <Mascot size={52} />
          </div>
          <div className="confirm-head__text">
            <div className="confirm-head__kicker">GOAL IS LIVE</div>
            <h2 className="confirm-head__title" id="goal-confirmed">
              {created.rule}
            </h2>
          </div>
        </div>
        <div className="summary">
          <div className="summary__row">
            <div className="summary__key">
              <div className="field-label">TRACKED BY</div>
            </div>
            <div className="summary__val">{TRACKER_SUMMARY[created.tracker]}</div>
          </div>
          <div className="summary__row">
            <div className="summary__key">
              <div className="field-label">CEILING</div>
            </div>
            <div className="summary__val">
              Level {created.ceiling} of {MAX_LEVEL} — {LEVEL_WORDS[created.ceiling]}
            </div>
          </div>
          <div className="summary__row">
            <div className="summary__key">
              <div className="field-label">FIRES</div>
            </div>
            <div className="summary__val">{TRIGGER_SUMMARY[created.trigger]}</div>
          </div>
        </div>
        <div className="modal__foot">
          <button className="btn btn--ghost" onClick={onClose}>
            Edit or delete — any time, no notice
          </button>
          <div className="modal__spacer" />
          <button className="btn btn--primary" onClick={onClose}>
            Got it
            <Arrow />
          </button>
        </div>
      </Modal>
    );
  }

  if (step === 2) {
    return (
      <Modal onDismiss={onClose} labelledBy="goal-step-2">
        <div className="modal__head">
          <div className="modal__step-row">
            <div className="modal__step">STEP 2 OF 2</div>
            <div className="modal__step-note">You set the ceiling. Buzz never exceeds it.</div>
          </div>
          <h2 className="modal__title" id="goal-step-2">
            How hard should it sting?
          </h2>
        </div>
        <div className="modal__body">
          <div className="field" style={{ gap: 12 }}>
            <div className="ladder-head">
              <div className="field-label">YOUR CEILING</div>
              <div className="ladder-head__value">
                Level {ceiling} of {MAX_LEVEL} · {LEVEL_WORDS[ceiling]}
              </div>
            </div>
            {/* The cap is its own ceiling here — this screen is the only path
                that can raise it, so every bar is selectable. */}
            <IntensityLadder
              value={ceiling}
              cap={MAX_LEVEL as Level}
              onChange={setCeiling}
            />
            <div className="note">
              <Shield />
              <span>
                Levels {Math.min(ceiling + 1, MAX_LEVEL)}–{MAX_LEVEL} stay locked. Nobody —
                not your crew, not Buzz — can raise this. Only you, and only from this screen.
              </span>
            </div>
          </div>

          <div className="field">
            <div className="field-label">WHEN IT FIRES</div>
            <div className="radios">
              <button
                type="button"
                className={`radio${trigger === 'weekly' ? ' radio--on' : ''}`}
                aria-pressed={trigger === 'weekly'}
                onClick={() => setTrigger('weekly')}
              >
                <span className="radio__dot" />
                <span className="radio__text">
                  <span className="radio__name">At the end of the week you missed</span>
                  <span className="radio__desc">
                    One zap, Sunday 9pm. Slips inside the week don't count.
                  </span>
                </span>
                <span className="radio__slot">
                  <span className="chip">GENTLEST</span>
                </span>
              </button>
              <button
                type="button"
                className={`radio${trigger === 'immediate' ? ' radio--on' : ''}`}
                aria-pressed={trigger === 'immediate'}
                onClick={() => setTrigger('immediate')}
              >
                <span className="radio__dot" />
                <span className="radio__text">
                  <span className="radio__name">The moment you slip</span>
                  <span className="radio__desc">
                    Every miss, right away. Most people regret this one by Thursday.
                  </span>
                </span>
                <span className="radio__slot" />
              </button>
            </div>
          </div>
        </div>
        <div className="modal__foot">
          <button className="btn btn--ghost" onClick={() => setStep(1)}>
            Back
          </button>
          <div className="modal__spacer" />
          <button className="btn btn--primary" onClick={create}>
            Create goal
            <Arrow />
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal onDismiss={onClose} labelledBy="goal-step-1">
      <div className="modal__head">
        <div className="modal__step-row">
          <div className="modal__step">STEP 1 OF 2</div>
          <div className="modal__step-note">Nothing fires until you say so.</div>
        </div>
        <h2 className="modal__title" id="goal-step-1">
          What are you holding yourself to?
        </h2>
      </div>
      <div className="modal__body">
        <div className="field">
          <label className="field-label" htmlFor="rule">
            THE RULE, IN YOUR WORDS
          </label>
          <div className="field__box">
            <input
              id="rule"
              className="field__input"
              value={rule}
              autoFocus
              placeholder="Gym before work, three days a week"
              onChange={(e) => setRule(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && rule.trim()) setStep(2);
              }}
            />
            <span className="caret" />
          </div>
        </div>

        <div className="field">
          <div className="field-label">HOW BUZZ KNOWS</div>
          <div className="tiles">
            {TRACKERS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`tile${tracker === t.id ? ' tile--on' : ''}`}
                  aria-pressed={tracker === t.id}
                  onClick={() => setTracker(t.id)}
                >
                  <span className="tile__icon">
                    <Icon />
                  </span>
                  <span className="tile__name">{t.name}</span>
                  <span className="tile__desc">{t.desc}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="modal__foot">
        <button className="btn btn--ghost" onClick={onClose}>
          Cancel
        </button>
        <div className="modal__spacer" />
        <button className="btn btn--primary" disabled={!rule.trim()} onClick={() => setStep(2)}>
          Set the sting
          <Arrow />
        </button>
      </div>
    </Modal>
  );
}
