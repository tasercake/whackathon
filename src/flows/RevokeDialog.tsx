import { Modal } from '../components/Modal';
import { useStore } from '../store/store';
import type { Grant } from '../types';

export function RevokeDialog({
  grant,
  onClose,
}: {
  grant: Grant;
  onClose: () => void;
}) {
  const { dispatch } = useStore();

  return (
    <Modal onDismiss={onClose} labelledBy="revoke-title" narrow>
      <div className="revoke__head">
        <div className="avatar avatar--56">{grant.name[0]?.toUpperCase()}</div>
        <h2 className="revoke__title" id="revoke-title">
          Take the switch back from {grant.name}?
        </h2>
        {/* they/them throughout — the name is user-entered and pronouns unknown. */}
        <p className="revoke__body">
          Their permission ends the moment you tap. They won’t be notified, and the app
          won’t tell them why. If you want them back later, you write a new one.
        </p>
      </div>
      <div className="revoke__foot">
        <button className="btn btn--outline" onClick={onClose}>
          Keep it as is
        </button>
        <button
          className="btn btn--primary"
          onClick={() => {
            // Instant. No notification, no grace period, no appeal.
            dispatch({ type: 'revokeGrant', id: grant.id });
            onClose();
          }}
        >
          Revoke now
        </button>
      </div>
    </Modal>
  );
}
