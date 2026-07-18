# Buzz — prototype

React + TypeScript + Vite. Both designed flows work end to end. All state lives in
localStorage; the shock calls are stubbed.

```bash
npm install
npm run dev
```

## Where things are

| Path | What |
| --- | --- |
| `src/services/shockService.ts` | **The network boundary.** `sendShock` / `receiveShock` are the only functions that would ever talk to a device or server. |
| `src/store/store.tsx` | Reducer + localStorage persistence (`buzz.state.v1`). |
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
- **The marketplace/buyer side inverts all of this.** It is deliberately absent from
  these light-mode flows. Keep it out.

Because the person's pronouns are unknown (the name is user-entered), the grant and
revoke copy uses they/them rather than guessing from a name.

## Not built

`Stats` is a nav destination only. Goal edit/delete and zap dispute exist in the data
model but have no UI yet — both were out of scope for the two designed flows.

## Hardware

Merged in from `origin/main`. The frontend above and this tree are two halves of the
same project; they had separate git histories until now.

| Path | What |
| --- | --- |
| `hardware/client/` | PlatformIO / Arduino firmware (`src/main.cpp`). Flash with `upload.sh`. |
| `hardware/server/` | Bun edge server that relays shock commands to the device. |

`src/services/shockService.ts` is still the stub boundary on the frontend side — wiring
it to `hardware/server` is the obvious next step, but nothing does it yet.
