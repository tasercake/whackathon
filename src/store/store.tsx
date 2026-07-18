import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import type { AppState, Goal, Grant, Level, ShockRecord } from '../types';
import { MAX_LEVEL } from '../types';

const STORAGE_KEY = 'buzz.state.v1';

const seed: AppState = {
  settings: { intensityCap: 3 },
  goals: [],
  grants: [],
  shocks: [],
};

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      settings: { ...seed.settings, ...parsed.settings },
      goals: parsed.goals ?? [],
      grants: parsed.grants ?? [],
      shocks: parsed.shocks ?? [],
    };
  } catch {
    return seed;
  }
}

export function clampToCap(level: number, cap: Level): Level {
  return Math.max(1, Math.min(level, cap)) as Level;
}

export function isLocked(level: number, cap: Level): boolean {
  return level > cap;
}

type Action =
  | { type: 'setCap'; cap: Level }
  | { type: 'addGoal'; goal: Goal }
  | { type: 'removeGoal'; id: string }
  | { type: 'addGrant'; grant: Grant }
  | { type: 'revokeGrant'; id: string }
  | { type: 'togglePause'; id: string }
  | { type: 'recordShock'; shock: ShockRecord }
  | { type: 'disputeShock'; id: string }
  | { type: 'reset' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'setCap': {
      const cap = clampToCap(action.cap, MAX_LEVEL as Level);
      // Lowering the cap pulls everything already set down with it — grants AND
      // goals. Nothing may sit above the ceiling by any path, including one that
      // was created back when the ceiling was higher.
      return {
        ...state,
        settings: { ...state.settings, intensityCap: cap },
        grants: state.grants.map((g) =>
          g.ceiling > cap ? { ...g, ceiling: cap } : g,
        ),
        goals: state.goals.map((g) =>
          g.ceiling > cap ? { ...g, ceiling: cap } : g,
        ),
      };
    }
    case 'addGoal':
      return { ...state, goals: [action.goal, ...state.goals] };
    case 'removeGoal':
      return { ...state, goals: state.goals.filter((g) => g.id !== action.id) };
    case 'addGrant':
      return { ...state, grants: [...state.grants, action.grant] };
    case 'revokeGrant':
      // Instant and silent. No tombstone, no notification, no grace period.
      return { ...state, grants: state.grants.filter((g) => g.id !== action.id) };
    case 'togglePause':
      return {
        ...state,
        grants: state.grants.map((g) =>
          g.id === action.id ? { ...g, paused: !g.paused } : g,
        ),
      };
    case 'recordShock':
      return {
        ...state,
        shocks: [action.shock, ...state.shocks],
        grants: state.grants.map((g) =>
          g.id === action.shock.grantId ? { ...g, used: g.used + 1 } : g,
        ),
      };
    case 'disputeShock':
      return {
        ...state,
        shocks: state.shocks.map((s) =>
          s.id === action.id ? { ...s, disputed: true } : s,
        ),
      };
    case 'reset':
      return seed;
    default:
      return state;
  }
}

interface Store {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

export function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
