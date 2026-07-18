import { useEffect, useState } from 'react';
import { Nav, type Tab } from './components/Nav';
import { GoalsScreen } from './screens/GoalsScreen';
import { CrewScreen } from './screens/CrewScreen';
import { NewGoalFlow } from './flows/NewGoalFlow';
import { NewGrantFlow } from './flows/NewGrantFlow';
import { RevokeDialog } from './flows/RevokeDialog';
import { StoreProvider, uid, useStore } from './store/store';
import { receiveShock } from './services/shockService';
import type { Grant } from './types';
import './styles/app.css';

type Overlay =
  | { kind: 'none' }
  | { kind: 'newGoal' }
  | { kind: 'newGrant' }
  | { kind: 'revoke'; grant: Grant };

function Shell() {
  const [tab, setTab] = useState<Tab>('goals');
  const [overlay, setOverlay] = useState<Overlay>({ kind: 'none' });
  const { state, dispatch } = useStore();
  const close = () => setOverlay({ kind: 'none' });

  // The one inbound edge. Everything it produces is a signed, disputable record.
  useEffect(() => {
    return receiveShock((incoming) => {
      dispatch({
        type: 'recordShock',
        shock: {
          id: uid('zap'),
          grantId: state.grants.find((g) => g.name === incoming.from)?.id ?? null,
          goalId: null,
          from: incoming.from,
          level: incoming.level,
          note: incoming.note,
          signature: incoming.signature,
          disputed: false,
          at: incoming.at,
        },
      });
    });
  }, [dispatch, state.grants]);

  return (
    <div className="page">
      <Nav active={tab} onNavigate={setTab} />

      {tab === 'crew' ? (
        <CrewScreen
          onTrustSomeone={() => setOverlay({ kind: 'newGrant' })}
          onRevoke={(grant) => setOverlay({ kind: 'revoke', grant })}
        />
      ) : (
        <GoalsScreen
          onNewGoal={() => setOverlay({ kind: 'newGoal' })}
          onEditPermissions={() => setTab('crew')}
        />
      )}

      {overlay.kind === 'newGoal' && <NewGoalFlow onClose={close} />}
      {overlay.kind === 'newGrant' && <NewGrantFlow onClose={close} />}
      {overlay.kind === 'revoke' && <RevokeDialog grant={overlay.grant} onClose={close} />}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
