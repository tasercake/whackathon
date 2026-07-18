/**
 * The network boundary.
 *
 * `sendShock` and `receiveShock` are the ONLY functions in this app that would
 * talk to a real device or server. Everything else — goals, grants, caps, usage
 * counters, paused state — is local state in localStorage. Swap the two bodies
 * below for real calls and nothing else has to change.
 */

import type { Level } from '../types';

export interface SendShockRequest {
  /** Who is pulling the trigger. `null` means Buzz fired it from a goal. */
  grantId: string | null;
  goalId: string | null;
  from: string;
  /** Already clamped to the user's cap by the caller. The device clamps again. */
  level: Level;
  note: string;
}

export interface SendShockResult {
  ok: boolean;
  /** Signature over the request. This is what makes a zap disputable. */
  signature: string;
  at: number;
  /** Set when the device refused — e.g. it clamped below the requested level. */
  refusedReason?: string;
}

export interface IncomingShock {
  from: string;
  level: Level;
  note: string;
  signature: string;
  at: number;
}

/** Stand-in for a real signature until there is a server to produce one. */
function stubSignature(req: SendShockRequest, at: number): string {
  const payload = `${req.from}|${req.level}|${req.note}|${at}`;
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    hash = (hash << 5) - hash + payload.charCodeAt(i);
    hash |= 0;
  }
  return `sig_${Math.abs(hash).toString(16).padStart(8, '0')}`;
}

/** STUB — fires a shock. Replace with the real device/API call. */
export async function sendShock(req: SendShockRequest): Promise<SendShockResult> {
  await new Promise((r) => setTimeout(r, 260));
  const at = Date.now();
  return { ok: true, signature: stubSignature(req, at), at };
}

/** STUB — subscribes to inbound shocks. Replace with a socket or push channel.
 *  Returns an unsubscribe function. */
export function receiveShock(handler: (shock: IncomingShock) => void): () => void {
  void handler;
  // No transport yet. A real implementation opens a connection here and calls
  // `handler` per inbound zap.
  return () => {};
}
