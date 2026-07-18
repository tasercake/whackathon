# Shockify Arduino Uno client

Arduino Uno firmware that lights a WS2812B strip red and activates a buzzer while a button is held.

## Wiring

| Uno connection | Device connection |
| --- | --- |
| D5 | One button terminal |
| GND | Other button terminal |
| D6 | 330–470 Ω series resistor, then WS2812B `DIN` |
| D9 | Buzzer signal / positive input |
| GND | WS2812B power-supply ground and buzzer ground |

Button uses Uno's internal pull-up resistor: released reads `HIGH`; pressed reads `LOW`. No external button resistor required.

Power WS2812B `5V` from a suitable external regulated 5 V supply, not Uno 5 V pin. Join external-supply ground, Uno ground, LED ground, and buzzer ground. Add a 500–1000 µF bulk capacitor across strip `5V` and `GND` near strip. Connect D6 to `DIN`, not `DOUT`. D9 may directly drive only a small buzzer within Uno GPIO limits; use a transistor/MOSFET driver for larger buzzers.

## Behavior

- Button released: LEDs and buzzer off
- Button held: all LEDs solid red and buzzer active at 2000 Hz
- Serial input is unused

## Compile-time constants

| Constant | Default | Meaning |
| --- | ---: | --- |
| `NUM_LEDS` | `18` | Number of WS2812B LEDs |
| `LED_DATA_PIN` | `6` | LED data pin |
| `BUTTON_PIN` | `5` | Active-low button pin |
| `BUZZER_PIN` | `9` | Buzzer output pin |
| `BUZZER_FREQUENCY` | `2000` | Buzzer frequency in Hz |

Override through PlatformIO `build_flags`, for example:

```ini
build_flags = -DNUM_LEDS=18 -DLED_DATA_PIN=6 -DBUTTON_PIN=5 -DBUZZER_PIN=9 -DBUZZER_FREQUENCY=2000
```

FastLED uses `WS2812B` with `GRB` order. FastLED is pinned to `3.10.3`.

## Build and upload

Connect Uno, close anything using serial port, then run:

```sh
./upload.sh
```

Override automatic port detection when needed:

```sh
PORT=/dev/cu.usbmodem2101 ./upload.sh
```
