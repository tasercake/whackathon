#include <Arduino.h>
#include <FastLED.h>

constexpr uint8_t LED_DATA_PIN = 6;
constexpr uint16_t NUM_LEDS = 8;

CRGB leds[NUM_LEDS];

void setup() {
  FastLED.addLeds<WS2812B, LED_DATA_PIN, GRB>(leds, NUM_LEDS);
  FastLED.setBrightness(128);
  fill_solid(leds, NUM_LEDS, CRGB::Red);
  FastLED.show();
}

void loop() {}
