import { Modal } from '../components/Modal';
import { useStore } from '../store/store';
import type { Goal } from '../types';

export function DeleteGoalDialog({
  goal,
  onClose,
}: {
  goal: Goal;
  onClose: () => void;
}) {
  const { dispatch } = useStore();

  return (
    <Modal onDismiss={onClose} labelledBy="delete-goal-title" narrow>
      <div className="revoke__head">
        <h2 className="revoke__title" id="delete-goal-title">
          Delete “{goal.rule}”?
        </h2>
        <p className="revoke__body">
          It stops watching you the moment you tap, and nothing about it is kept — not
          the rule, not the day count. Nobody is told. You can write it again from
          scratch whenever you want.
        </p>
      </div>
      <div className="revoke__foot">
        <button className="btn btn--outline" onClick={onClose}>
          Keep it
        </button>
        <button
          className="btn btn--primary"
          onClick={() => {
            dispatch({ type: 'removeGoal', id: goal.id });
            onClose();
          }}
        >
          Delete goal
        </button>
      </div>
    </Modal>
  );
}
