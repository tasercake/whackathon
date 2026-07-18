/**
 * Allowance weeks.
 *
 * A grant's `allowance` is per week, and the copy the user reads says the
 * charges come back "Monday" — so a week here starts Monday at local midnight.
 * `used` is only meaningful together with the week it was counted in; read it
 * through `chargesUsed` rather than off the grant.
 */

import type { Grant } from '../types';

/** Local midnight on the Monday of the week containing `at`. */
export function weekStart(at: number): number {
  const d = new Date(at);
  d.setHours(0, 0, 0, 0);
  // getDay() is Sunday-first; shift so Monday is 0.
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.getTime();
}

/** Charges spent in the week containing `now`. A grant whose counter belongs
 *  to an earlier week has already rolled over — it reads as 0, untouched. */
export function chargesUsed(grant: Grant, now: number): number {
  return grant.usedWeek === weekStart(now) ? grant.used : 0;
}

/** Charges still available this week. Never negative. */
export function chargesLeft(grant: Grant, now: number): number {
  return Math.max(0, grant.allowance - chargesUsed(grant, now));
}
