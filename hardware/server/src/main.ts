// @ts-expect-error bun-serialport 0.1.1 does not publish TypeScript declarations.
import { SerialPort } from "bun-serialport";
import { config } from "./config";

const serial = new SerialPort({
  path: config.serialPath,
  baudRate: config.baudRate,
  autoOpen: false,
});

let socket: WebSocket | undefined;
let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
let shuttingDown = false;
let writeChain = Promise.resolve();

function validRequestId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function sendResult(ws: WebSocket, requestId: string, ok: boolean, error?: string): void {
  if (ws.readyState !== WebSocket.OPEN) {
    console.error(`Cannot send result for ${requestId}: WebSocket is not open`);
    return;
  }

  ws.send(JSON.stringify(ok
    ? { type: "COMMAND_RESULT", requestId, ok: true }
    : { type: "COMMAND_RESULT", requestId, ok: false, error }));
}

function handleMessage(ws: WebSocket, frame: unknown): void {
  if (typeof frame !== "string") {
    console.error("Rejected non-text WebSocket frame");
    return;
  }

  let message: unknown;
  try {
    message = JSON.parse(frame);
  } catch {
    console.error("Rejected unparseable WebSocket message");
    return;
  }

  if (typeof message !== "object" || message === null || Array.isArray(message)) {
    console.error("Rejected WebSocket message without requestId");
    return;
  }

  const command = message as Record<string, unknown>;
  if (!validRequestId(command.requestId)) {
    console.error("Rejected WebSocket message without valid requestId");
    return;
  }

  const requestId = command.requestId;
  const valid = command.type === "DO_SHOCK"
    && typeof command.intensity === "number"
    && Number.isFinite(command.intensity)
    && command.intensity >= 0
    && command.intensity <= 1
    && typeof command.duration === "number"
    && Number.isInteger(command.duration)
    && command.duration >= 1
    && command.duration <= 10_000
    && typeof command.buzz_on === "boolean";

  if (!valid) {
    console.error(`Rejected malformed command ${requestId}`);
    sendResult(ws, requestId, false, "Malformed DO_SHOCK command");
    return;
  }

  const intensity = command.intensity as number;
  const duration = command.duration as number;
  const buzzOn = command.buzz_on as boolean;
  const serialCommand = `DO_SHOCK ${intensity.toFixed(3)} ${duration} ${buzzOn ? 1 : 0}\n`;
  writeChain = writeChain.then(async () => {
    try {
      await serial.write(serialCommand);
      sendResult(ws, requestId, true);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      console.error(`Serial write failed for ${requestId}: ${detail}`);
      sendResult(ws, requestId, false, detail);
    }
  });
}

function connect(): void {
  if (shuttingDown) return;

  console.log(`Connecting to ${config.managementServerUrl}`);
  const ws = new WebSocket(config.managementServerUrl);
  socket = ws;

  ws.addEventListener("open", () => {
    console.log("Management WebSocket connected");
    ws.send(JSON.stringify({
      type: "REGISTER",
      deviceId: config.deviceId,
      token: config.deviceToken,
    }));
  });

  ws.addEventListener("message", (event) => handleMessage(ws, event.data));
  ws.addEventListener("error", () => console.error("Management WebSocket error"));
  ws.addEventListener("close", () => {
    console.log("Management WebSocket closed");
    if (socket === ws) socket = undefined;
    if (!shuttingDown) reconnectTimer = setTimeout(connect, 2_000);
  });
}

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`Shutting down on ${signal}`);

  if (reconnectTimer !== undefined) clearTimeout(reconnectTimer);
  socket?.close();
  await writeChain;

  try {
    await serial.close();
  } catch (error) {
    console.error("Serial close failed:", error);
  }
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

await serial.open();
console.log(`Serial open: ${config.serialPath} at ${config.baudRate} baud`);
connect();
