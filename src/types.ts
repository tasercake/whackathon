/** Intensity runs 1–8. The user picks a ceiling; everything above it is locked
 *  from every path — goals, grants, and the send path alike. */
export const MAX_LEVEL = 8;

export type Level = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/** How Buzz learns whether you held the rule. */
export type Tracker = 'band' | 'checkin' | 'witness';

/** When a miss turns into a zap. */
export type Trigger = 'weekly' | 'immediate';

export interface Goal {
  id: string;
  /** Free text, authored by the user. Never generated, never suggested. */
  rule: string;
  tracker: Tracker;
  trigger: Trigger;
  /** Snapshot of the cap at creation, for display on the goal. */
  ceiling: Level;
  createdAt: number;
}

export interface Grant {
  id: string;
  /** Display name of the person holding the switch. */
  name: string;
  /** Optional relationship line, e.g. "Sister · on Buzz since March". */
  relation: string;
  /** The grant IS this sentence. The grantee sees it and nothing else. */
  sentence: string;
  /** Never exceeds the user's own cap. */
  ceiling: Level;
  /** Charges per week. */
  allowance: number;
  /** Charges spent this week. */
  used: number;
  /** Paused grants keep their sentence but can't fire. */
  paused: boolean;
  createdAt: number;
}

/** A zap that actually landed. Every peer-sent shock is signed and disputable. */
export interface ShockRecord {
  id: string;
  /** Grant id, or null when Buzz fired it from a goal. */
  grantId: string | null;
  /** Goal id when Buzz fired it. */
  goalId: string | null;
  from: string;
  level: Level;
  note: string;
  /** Signature returned by the service — what makes it disputable. */
  signature: string;
  disputed: boolean;
  at: number;
}

export interface Settings {
  /** The one ceiling. Only the user can raise it, and only from the goal flow. */
  intensityCap: Level;
}

export interface AppState {
  settings: Settings;
  goals: Goal[];
  grants: Grant[];
  shocks: ShockRecord[];
}
