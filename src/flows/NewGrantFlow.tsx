import { useState } from 'react';
import { Modal } from '../components/Modal';
import { Arrow } from '../components/art';
import { uid, useStore } from '../store/store';
import { weekStart } from '../lib/week';
import type { Grant, Level } from '../types';

const MAX_ALLOWANCE = 7;

export function NewGrantFlow({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useStore();
  const cap = state.settings.intensityCap;

  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [sentence, setSentence] = useState('');
  const [allowance, setAllowance] = useState(2);

  const who = name.trim() || 'them';
  const initial = (name.trim()[0] ?? '?').toUpperCase();
  const ready = Boolean(name.trim() && sentence.trim());

  function give() {
    const grant: Grant = {
      id: uid('grant'),
      name: name.trim(),
      relation: relation.trim(),
      sentence: sentence.trim(),
      // A grant can never sit above the user's own ceiling.
      ceiling: cap as Level,
      allowance,
      used: 0,
      usedWeek: weekStart(Date.now()),
      paused: false,
      createdAt: Date.now(),
    };
    dispatch({ type: 'addGrant', grant });
    onClose();
  }

  return (
    <Modal onDismiss={onClose} labelledBy="grant-title">
      <div className="modal__head">
        <div className="modal__step-row">
          <div className="modal__step">TRUSTING SOMEONE</div>
          <div className="modal__step-note">They never see these settings.</div>
        </div>
        <h2 className="modal__title" id="grant-title">
          What are you letting {who} do?
        </h2>
      </div>

      <div className="modal__body" style={{ gap: 24 }}>
        <div className="person">
          <div className="avatar avatar--44">{initial}</div>
          <div className="person__text">
            <input
              className="person__name"
              value={name}
              autoFocus
              placeholder="Their name"
              aria-label="Their name"
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="person__relation"
              value={relation}
              placeholder="Sister · on Buzz since March"
              aria-label="How you know them"
              onChange={(e) => setRelation(e.target.value)}
            />
          </div>
          <div className="person__slot" style={{ width: 80, flexShrink: 0 }} />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="sentence">
            THE PERMISSION, IN YOUR WORDS
          </label>
          <div className="field__box field__box--tall">
            <textarea
              id="sentence"
              className="field__input field__input--lg"
              rows={3}
              value={sentence}
              placeholder={`${who === 'them' ? 'They' : who} can zap me if…`}
              aria-label="The permission, in your words"
              onChange={(e) => setSentence(e.target.value)}
            />
          </div>
          <div className="field__hint">
            They see this sentence and nothing else. They don’t see your goals, your
            streak, or whether the zap landed.
          </div>
        </div>

        <div className="stats">
          <div className="stat">
            <div className="stat__key">THEIR CEILING</div>
            <div className="stat__value">Level {cap}</div>
            <div className="stat__desc">Same as your own cap. They can’t go past it.</div>
          </div>
          <div className="stat">
            <div className="stat__key">HOW OFTEN</div>
            <div className="stat__stepper">
              <button
                className="stepper-btn"
                aria-label="Fewer charges per week"
                disabled={allowance <= 1}
                onClick={() => setAllowance((a) => Math.max(1, a - 1))}
              >
                −
              </button>
              <div className="stat__value">
                {allowance} a week
              </div>
              <button
                className="stepper-btn"
                aria-label="More charges per week"
                disabled={allowance >= MAX_ALLOWANCE}
                onClick={() => setAllowance((a) => Math.min(MAX_ALLOWANCE, a + 1))}
              >
                +
              </button>
            </div>
            <div className="stat__desc">
              After that they’re out of charges until Monday.
            </div>
          </div>
        </div>
      </div>

      <div className="modal__foot">
        <div className="modal__foot-note">
          You can pull this back the second you want to. They won’t be told.
        </div>
        <button className="btn btn--ghost" onClick={onClose}>
          Cancel
        </button>
        <button className="btn btn--primary" disabled={!ready} onClick={give}>
          Give {who} the switch
          <Arrow />
        </button>
      </div>
    </Modal>
  );
}
