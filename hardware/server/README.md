# Shockify edge server

Small Bun service connecting Shockify management WebSocket to an Arduino USB serial port. Supported on macOS and Linux.

## Requirements

- Bun **1.3.14**
- Arduino or compatible serial device

## Setup

```sh
bun install --frozen-lockfile
```

Configure environment variables in the process environment (no `.env` library is used):

| Variable | Required | Description |
|---|---:|---|
| `MANAGEMENT_SERVER_URL` | yes | Management WebSocket URL (`ws://` or `wss://`) |
| `DEVICE_ID` | yes | Edge device ID |
| `DEVICE_TOKEN` | yes | Registration token |
| `SERIAL_PATH` | yes | Serial device path, such as `/dev/tty.usbmodem1101` or `/dev/ttyACM0` |
| `BAUD_RATE` | no | Positive integer; defaults to `115200` |

Run:

```sh
MANAGEMENT_SERVER_URL=wss://example.test/edge \
DEVICE_ID=edge-1 \
DEVICE_TOKEN=secret \
SERIAL_PATH=/dev/ttyACM0 \
bun run start
```

## Protocol

Serial opens before WebSocket connection. On each WebSocket open, edge sends:

```json
{"type":"REGISTER","deviceId":"edge-1","token":"secret"}
```

Management commands must have type `DO_SHOCK`, nonempty string `requestId`, finite `intensity` from 0 through 1, integer `duration` from 1 through 10000 milliseconds, and boolean `buzz_on`.

A valid command produces exactly one serialized ASCII write:

```text
DO_SHOCK 0.750 500 1\n
```

After write resolves, edge replies with `COMMAND_RESULT` and `ok: true`. For malformed commands carrying a valid request ID or serial-write failures, it replies with `ok: false` and an error string. Unparseable messages and messages without a valid request ID are logged without a reply. No command deduplication is performed.

Closed management connections reconnect after two seconds. `SIGINT` and `SIGTERM` stop reconnecting, close WebSocket, then close serial.

## ACK limitation

A successful result means only that the serial write Promise resolved. Arduino emits `ACK DO_SHOCK`, but the edge server does not consume it yet, so success does **not** prove physical execution (or LED/shock activation).
