#include <Arduino.h>
#include <FastLED.h>

#ifndef NUM_LEDS
#define NUM_LEDS 18
#endif

#ifndef LED_DATA_PIN
#define LED_DATA_PIN 6
#endif

#ifndef BUTTON_PIN
#define BUTTON_PIN 5
#endif

#ifndef BUZZER_PIN
#define BUZZER_PIN 9
#endif

#ifndef BUZZER_FREQUENCY
#define BUZZER_FREQUENCY 2000
#endif

CRGB leds[NUM_LEDS];
bool wasPressed = false;

void setOutputs(bool on) {
  fill_solid(leds, NUM_LEDS, on ? CRGB::Red : CRGB::Black);
  FastLED.show();
  if (on) {
    tone(BUZZER_PIN, BUZZER_FREQUENCY);
  } else {
    noTone(BUZZER_PIN);
  }
}

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);
  FastLED.addLeds<WS2812B, LED_DATA_PIN, GRB>(leds, NUM_LEDS);
  setOutputs(false);
}

void loop() {
  const bool pressed = digitalRead(BUTTON_PIN) == LOW;
  if (pressed != wasPressed) {
    setOutputs(pressed);
    wasPressed = pressed;
  }
}
