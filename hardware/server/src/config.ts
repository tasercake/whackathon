function required(name: string): string {
  const value = Bun.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

const managementServerUrl = required("MANAGEMENT_SERVER_URL");
const url = new URL(managementServerUrl);
if (url.protocol !== "ws:" && url.protocol !== "wss:") {
  throw new Error("MANAGEMENT_SERVER_URL must use ws:// or wss://");
}

const baudRateText = Bun.env.BAUD_RATE?.trim() || "115200";
const baudRate = Number(baudRateText);
if (!Number.isInteger(baudRate) || baudRate <= 0) {
  throw new Error("BAUD_RATE must be a positive integer");
}

export const config = {
  managementServerUrl,
  deviceId: required("DEVICE_ID"),
  deviceToken: required("DEVICE_TOKEN"),
  serialPath: required("SERIAL_PATH"),
  baudRate,
};
