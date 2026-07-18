#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if ! command -v pio >/dev/null 2>&1; then
  echo "Error: PlatformIO CLI ('pio') not found." >&2
  echo "Install it with: brew install platformio" >&2
  exit 1
fi

if [[ -n "${PORT:-}" ]]; then
  if [[ ! -e "$PORT" ]]; then
    echo "Error: PORT does not exist: $PORT" >&2
    exit 1
  fi
  upload_port="$PORT"
else
  ports=()
  for candidate in /dev/cu.usbmodem* /dev/cu.usbserial* /dev/ttyACM* /dev/ttyUSB*; do
    [[ -e "$candidate" ]] && ports+=("$candidate")
  done

  case ${#ports[@]} in
    0)
      echo "Error: no Arduino serial device found." >&2
      echo "Connect Arduino, then retry; or set PORT=/path/to/device." >&2
      exit 1
      ;;
    1)
      upload_port="${ports[0]}"
      ;;
    *)
      echo "Error: multiple serial devices found:" >&2
      printf '  %s\n' "${ports[@]}" >&2
      echo "Choose one with: PORT=/path/to/device ./upload.sh" >&2
      exit 1
      ;;
  esac
fi

echo "Building Arduino Uno firmware..."
pio run --environment uno

echo "Uploading to $upload_port..."
pio run --environment uno --target upload --upload-port "$upload_port"

echo "Upload complete."
