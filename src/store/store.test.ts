import { describe, expect, it } from 'vitest';
import { reducer, seed } from './store';
import { weekStart } from '../lib/week';
import type { AppState, Goal, Grant, Level, ShockRecord } from '../types';

function goal(over: Partial<Goal> = {}): Goal {
  return {
    id: 'goal_1',
    rule: 'Gym before work, three days a week',
    tracker: 'band',
    trigger: 'weekly',
    ceiling: 3,
    createdAt: 0,
    ...over,
  };
}

function grant(over: Partial<Grant> = {}): Grant {
  return {
    id: 'grant_1',
    name: 'Ada',
    relation: '',
    sentence: 'They can zap me if I skip the gym.',
    ceiling: 3,
    allowance: 2,
    used: 0,
    usedWeek: weekStart(0),
    paused: false,
    createdAt: 0,
    ...over,
  };
}

function shock(over: Partial<ShockRecord> = {}): ShockRecord {
  return {
    id: 'zap_1',
    grantId: 'grant_1',
    goalId: null,
    from: 'Ada',
    level: 3,
    note: '',
    signature: 'sig_00000000',
    disputed: false,
    at: 0,
    ...over,
  };
}

function state(over: Partial<AppState> = {}): AppState {
  return { ...seed, ...over };
}

/** The invariant that already shipped one bug: it clamped grants but not
 *  goals, so a goal created at L6 survived a drop to cap 2. */
describe('setCap — nothing sits above the ceiling by any path', () => {
  it('clamps goals down when the cap drops', () => {
    const next = reducer(
      state({ settings: { intensityCap: 6 }, goals: [goal({ ceiling: 6 })] }),
      { type: 'setCap', cap: 2 },
    );
    expect(next.goals[0].ceiling).toBe(2);
  });

  it('clamps grants down when the cap drops', () => {
    const next = reducer(
      state({ settings: { intensityCap: 6 }, grants: [grant({ ceiling: 6 })] }),
      { type: 'setCap', cap: 2 },
    );
    expect(next.grants[0].ceiling).toBe(2);
  });

  it('clamps goals and grants together, in one pass', () => {
    const next = reducer(
      state({
        settings: { intensityCap: 8 },
        goals: [goal({ id: 'g1', ceiling: 8 }), goal({ id: 'g2', ceiling: 5 })],
        grants: [grant({ id: 'r1', ceiling: 7 }), grant({ id: 'r2', ceiling: 4 })],
      }),
      { type: 'setCap', cap: 4 },
    );
    expect(next.goals.map((g) => g.ceiling)).toEqual([4, 4]);
    expect(next.grants.map((g) => g.ceiling)).toEqual([4, 4]);
  });

  it('leaves anything already under the cap alone', () => {
    const next = reducer(
      state({
        settings: { intensityCap: 2 },
        goals: [goal({ ceiling: 1 })],
        grants: [grant({ ceiling: 2 })],
      }),
      { type: 'setCap', cap: 5 },
    );
    // Raising the ceiling does not raise anything under it.
    expect(next.goals[0].ceiling).toBe(1);
    expect(next.grants[0].ceiling).toBe(2);
  });

  it('holds after a drop and a raise — the low value does not come back', () => {
    const start = state({
      settings: { intensityCap: 6 },
      goals: [goal({ ceiling: 6 })],
      grants: [grant({ ceiling: 6 })],
    });
    const dropped = reducer(start, { type: 'setCap', cap: 2 });
    const raised = reducer(dropped, { type: 'setCap', cap: 8 });
    expect(raised.goals[0].ceiling).toBe(2);
    expect(raised.grants[0].ceiling).toBe(2);
  });

  it('refuses a cap outside 1–8', () => {
    expect(reducer(state(), { type: 'setCap', cap: 99 as Level }).settings.intensityCap).toBe(8);
    expect(reducer(state(), { type: 'setCap', cap: 0 as Level }).settings.intensityCap).toBe(1);
  });
});

describe('recordShock — the weekly allowance rolls over', () => {
  const monday = weekStart(new Date(2026, 6, 13, 12).getTime());
  const sameWeek = monday + 3 * 86_400_000;
  const nextWeek = monday + 8 * 86_400_000;

  it('counts a zap against the week it landed in', () => {
    const next = reducer(
      state({ grants: [grant({ used: 0, usedWeek: monday })] }),
      { type: 'recordShock', shock: shock({ at: sameWeek }) },
    );
    expect(next.grants[0].used).toBe(1);
    expect(next.grants[0].usedWeek).toBe(monday);
  });

  it('resets a counter left over from an earlier week', () => {
    const next = reducer(
      // Spent out last week...
      state({ grants: [grant({ allowance: 2, used: 2, usedWeek: monday })] }),
      // ...and the first zap of the new week is charge one, not three.
      { type: 'recordShock', shock: shock({ at: nextWeek }) },
    );
    expect(next.grants[0].used).toBe(1);
    expect(next.grants[0].usedWeek).toBe(weekStart(nextWeek));
  });

  it('never counts past the allowance', () => {
    // The disabled button is a courtesy — same-tick clicks got past it once,
    // and an inbound zap off a real transport never sees it at all.
    const next = reducer(
      state({ grants: [grant({ allowance: 2, used: 2, usedWeek: monday })] }),
      { type: 'recordShock', shock: shock({ at: sameWeek }) },
    );
    expect(next.grants[0].used).toBe(2);
  });

  it('still keeps the signed record of a zap it could not charge', () => {
    // It landed. The counter is the budget; the record is the evidence.
    const next = reducer(
      state({ grants: [grant({ allowance: 1, used: 1, usedWeek: monday })] }),
      { type: 'recordShock', shock: shock({ at: sameWeek }) },
    );
    expect(next.shocks).toHaveLength(1);
    expect(next.shocks[0].signature).toBe('sig_00000000');
  });

  it('only touches the grant that fired', () => {
    const next = reducer(
      state({
        grants: [grant({ id: 'r1', used: 1, usedWeek: monday }), grant({ id: 'r2' })],
      }),
      { type: 'recordShock', shock: shock({ grantId: 'r1', at: sameWeek }) },
    );
    expect(next.grants[0].used).toBe(2);
    expect(next.grants[1].used).toBe(0);
  });

  it('records a Buzz-fired zap without charging anyone', () => {
    const next = reducer(state({ grants: [grant({ used: 1, usedWeek: monday })] }), {
      type: 'recordShock',
      shock: shock({ grantId: null, goalId: 'goal_1', at: sameWeek }),
    });
    expect(next.shocks).toHaveLength(1);
    expect(next.grants[0].used).toBe(1);
  });
});

describe('revokeGrant — instant and silent', () => {
  it('removes the grant outright, leaving no tombstone', () => {
    const next = reducer(state({ grants: [grant()] }), {
      type: 'revokeGrant',
      id: 'grant_1',
    });
    expect(next.grants).toEqual([]);
  });

  it('keeps the signed records of zaps already sent', () => {
    const next = reducer(state({ grants: [grant()], shocks: [shock()] }), {
      type: 'revokeGrant',
      id: 'grant_1',
    });
    expect(next.shocks).toHaveLength(1);
  });
});

describe('removeGoal', () => {
  it('deletes only the named goal', () => {
    const next = reducer(
      state({ goals: [goal({ id: 'g1' }), goal({ id: 'g2' })] }),
      { type: 'removeGoal', id: 'g1' },
    );
    expect(next.goals.map((g) => g.id)).toEqual(['g2']);
  });
});
