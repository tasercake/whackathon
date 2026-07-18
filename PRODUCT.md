## Product summary

Shockify is a 3-tier platform.

First, it's a self-improvement device and app that helps individuals be better people by nudging them away from behaviors they want to avoid, and builds better habits in their place. It's a combination of a shock bracelet that you purchase and configure to give you a *bzzzt* when you engage in an undesirable behavior.

Second, a friend-shocking system. The edge server is always listening to the environment and when it detects an undesirable behavior, it notifies a configured Telegram group of tested friends and presents a 'Good / No Good' poll. Based on the poll results, the server may transmit a shock trigger to the offending user.

Third and most important because it's our real cash cow: an open market ecosystem where companies and institutions can purchase the ability to shock individuals to influence their actions.

(This is satire - don't worry; we're not actually hurting anyone 😉)

## Components

1. **Shockify Server (Bun + TypeScript)** — Registers edge devices, stores device identity and status, exposes control APIs, and, and routes LED commands to the correct edge server.
2. **Edge Server (Bun + TypeScript)** — Maintains a connection to the management server, receives and validates remote triggers, then writes commands to the Arduino over USB serial.
3. **Bracelet** — Connects to the edge server over USB, reads serial commands such as `DO_SHOCK\n`, and controls the shock device. We don't actually have a shock device, so we're simulating it with an LED strip instead.
