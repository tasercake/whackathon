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
import { weekStart } from '../lib/week';

const STORAGE_KEY = 'buzz.state.v1';

export const seed: AppState = {
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
      // Grants written before `usedWeek` existed get the week they were
      // created in. If that's in the past their counter reads as spent-and-
      // rolled-over, which is the forgiving direction to guess wrong in.
      grants: (parsed.grants ?? []).map((g) => ({
        ...g,
        usedWeek: g.usedWeek ?? weekStart(g.createdAt),
      })),
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

export function reducer(state: AppState, action: Action): AppState {
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
    case 'recordShock': {
      // The week is taken from the shock, not from the clock, so the reducer
      // stays pure and a zap always counts against the week it landed in.
      const week = weekStart(action.shock.at);
      return {
        ...state,
        shocks: [action.shock, ...state.shocks],
        grants: state.grants.map((g) =>
          g.id === action.shock.grantId
            ? {
                ...g,
                // A counter left over from an earlier week has rolled over —
                // this zap is the first charge of the new one. Clamped at the
                // allowance so the counter can never read "3 of 2", whatever
                // the caller does: the UI's disabled button is a courtesy, and
                // an inbound zap off a real transport never passed it at all.
                used: Math.min(g.allowance, (g.usedWeek === week ? g.used : 0) + 1),
                usedWeek: week,
              }
            : g,
        ),
      };
    }
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
