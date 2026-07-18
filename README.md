# Buzz — prototype

React + TypeScript + Vite. Both designed flows work end to end. All state lives in
localStorage; the shock calls are stubbed.

```bash
npm install
npm run dev
npm test      # reducer tests — the product invariants below
```

## Where things are

| Path | What |
| --- | --- |
| `src/services/shockService.ts` | **The network boundary.** `sendShock` / `receiveShock` are the only functions that would ever talk to a device or server. |
| `src/store/store.tsx` | Reducer + localStorage persistence (`buzz.state.v1`). Tests in `store.test.ts`. |
| `src/lib/week.ts` | Allowance weeks. `used` is only meaningful with `usedWeek` — read it through `chargesUsed`. |
| `src/styles/tokens.css` | Design values from the Paper file, as CSS variables. |
| `src/flows/` | The two multi-step flows and the revoke dialog. |
| `src/screens/` | Goals and Crew. |

## Design source

Paper file `Scratchpad`, page 1 — artboards `04a · Goal flow — 1…4` and
`04b · Crew flow — 1…4`. Values were read via `get_jsx` / `get_computed_styles`,
not from screenshots.

The font is `system-ui, sans-serif` — **not** Bricolage Grotesque, whatever older
project notes say. The artboards don't use it.

## Rules the UI is built to keep

These are product invariants, not copy. Don't implement them away.

- **Goals are user-authored free text.** Nothing is suggested or generated.
- **One ceiling, set only by the user.** `settings.intensityCap` is editable from the
  goal flow's step 2 and nowhere else. Lowering it clamps every existing goal *and*
  grant down with it, so nothing can sit above the cap by any path — including things
  created when the cap was higher. See the `setCap` case in the reducer.
- **A grant is a sentence the user writes.** The grantee sees that sentence and
  nothing else — not goals, not streaks, not whether a zap landed.
- **Revocation is instant and silent.** No notification, no grace period, no appeal,
  no tombstone — the grant is removed outright.
- **Every peer-sent shock is signed and disputable.** `ShockRecord` carries the
  signature returned by the service and a `disputed` flag.
- **A grant's allowance is per week, and it comes back.** Charges reset Monday at
  local midnight. The counter is clamped at the allowance in the reducer, not just
  by a disabled button — an inbound zap off a real transport never sees the UI.
  A zap that couldn't be charged still keeps its signed record.
- **The marketplace/buyer side inverts all of this.** It is deliberately absent from
  these light-mode flows. Keep it out.

Because the person's pronouns are unknown (the name is user-entered), the grant and
revoke copy uses they/them rather than guessing from a name.

## Not built

`Stats` is a nav destination only. Goal **edit** and zap **dispute** are still reducer
actions with no UI. The crew footnote deliberately promises only that zaps are signed,
not that you can dispute them — there is no inbox to dispute from yet. Restore the
other half of that sentence when there is one.

Goal delete is built (card action → confirmation dialog).

There is no real send path. The crew row's dashed **Zap** button is dev-only
(`import.meta.env.DEV`) and exists to exercise `sendShock` → `ShockRecord` → the
`used` counter without a device; it is not part of either designed flow.

## Hardware

Merged in from `origin/main`. The frontend above and this tree are two halves of the
same project; they had separate git histories until now.

| Path | What |
| --- | --- |
| `hardware/client/` | PlatformIO / Arduino firmware (`src/main.cpp`). Flash with `upload.sh`. |
| `hardware/server/` | Bun edge server that relays shock commands to the device. |

`src/services/shockService.ts` is still the stub boundary on the frontend side — wiring
it to `hardware/server` is the obvious next step, but nothing does it yet.
