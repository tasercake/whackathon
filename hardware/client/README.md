# Shockify Arduino Uno client

Arduino Uno ATmega328P firmware that simulates a Shockify event with red WS2812B LEDs and an optional buzzer. It does **not** drive or implement an electrical shock device.

## Wiring

Use this exact signal schema with the defaults:

| Uno connection | Device connection |
| --- | --- |
| D6 | 330–470 Ω series resistor, then WS2812B `DIN` |
| D9 | Buzzer signal / positive input |
| GND | WS2812B power-supply ground and buzzer ground |
| USB | Edge server serial connection and Uno power |

Power WS2812B `5V` from a suitable **external regulated 5 V supply**, not from the Uno 5 V pin. Join external-supply ground, Uno ground, LED ground, and buzzer ground. Add a 500–1000 µF bulk capacitor across LED-strip `5V` and `GND` near the strip (observe polarity). Connect data to `DIN`, not `DOUT`.

D9 may directly drive only a small buzzer whose voltage/current are within Uno GPIO limits. For larger or inductive buzzers, use a suitable transistor/MOSFET driver (and flyback diode when applicable) with common ground. `tone()` produces a square wave for a passive buzzer; many active buzzers merely switch on and may ignore frequency.

## Serial protocol

Serial settings: **115200 baud, 8-N-1**. Send one ASCII newline-terminated command:

```text
DO_SHOCK <intensity> <duration_ms> <buzz_on>\n
```

Example:

```text
DO_SHOCK 0.750 500 1
```

- `intensity`: finite unsigned decimal from `0` through `1`
- `duration_ms`: integer from `1` through `10000`
- `buzz_on`: exactly `0` or `1`

Malformed, overflowing, out-of-range, overlong, or trailing-field lines are silently rejected. For each valid command, firmware immediately responds with `ACK DO_SHOCK\n` before running the effect. An overlong line is discarded in full through its newline. Effect timing is intentionally blocking; commands received by USB hardware during an effect remain serial-buffered and are processed afterward, subject to the Uno serial buffer's capacity.

A valid command lights all LEDs red at brightness `round(intensity * 255)`, optionally starts the buzzer, waits for the duration, then turns LEDs and buzzer off.

## Compile-time constants

Defaults are in `src/main.cpp` and can be overridden with PlatformIO `build_flags` using `-D`:

| Constant | Default | Meaning |
| --- | ---: | --- |
| `NUM_LEDS` | `8` | Number of WS2812B LEDs |
| `LED_DATA_PIN` | `6` (D6) | LED data GPIO |
| `BUZZER_PIN` | `9` (D9) | Buzzer GPIO |
| `BUZZER_FREQUENCY` | `2000` | Passive-buzzer frequency in Hz |

Example override:

```ini
build_flags = -DNUM_LEDS=16 -DLED_DATA_PIN=6 -DBUZZER_PIN=9 -DBUZZER_FREQUENCY=2500
```

FastLED uses `WS2812B` with `GRB` color order. Dependency is pinned to FastLED 3.10.3 in `platformio.ini`; buzzer control uses Arduino `tone()` / `noTone()`.

## Build, upload, monitor

Install PlatformIO, connect Uno, then upload from `hardware/client`:

```sh
./upload.sh
```

The script detects one connected Arduino serial device. Override detection with `PORT=/dev/cu.usbmodem2101 ./upload.sh`.

Manual PlatformIO commands:

```sh
pio run
pio run --target upload
pio device monitor --baud 115200
```

Close any serial monitor and the edge server before uploading; only one process can own the serial port.
