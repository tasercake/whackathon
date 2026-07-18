#include <Arduino.h>
#include <FastLED.h>
#include <ctype.h>
#include <errno.h>
#include <math.h>
#include <stdlib.h>
#include <string.h>

#ifndef NUM_LEDS
#define NUM_LEDS 8
#endif

#ifndef LED_DATA_PIN
#define LED_DATA_PIN 6
#endif

#ifndef BUZZER_PIN
#define BUZZER_PIN 9
#endif

#ifndef BUZZER_FREQUENCY
#define BUZZER_FREQUENCY 2000
#endif

constexpr size_t INPUT_BUFFER_SIZE = 64;
CRGB leds[NUM_LEDS];
char inputBuffer[INPUT_BUFFER_SIZE];
size_t inputLength = 0;
bool discardingLine = false;

bool parseIntensity(const char *text, const char *end, float &value) {
  if (text == end || !isdigit(static_cast<unsigned char>(*text))) return false;

  const char *cursor = text;
  while (cursor < end && isdigit(static_cast<unsigned char>(*cursor))) ++cursor;
  if (cursor < end && *cursor == '.') {
    ++cursor;
    if (cursor == end || !isdigit(static_cast<unsigned char>(*cursor))) return false;
    while (cursor < end && isdigit(static_cast<unsigned char>(*cursor))) ++cursor;
  }
  if (cursor != end) return false;

  errno = 0;
  char *parsedEnd = nullptr;
  value = strtod(text, &parsedEnd);
  return parsedEnd == end && errno != ERANGE && isfinite(value) && value >= 0.0f &&
         value <= 1.0f;
}

bool parseDuration(const char *text, const char *end, uint16_t &value) {
  if (text == end) return false;
  uint32_t parsed = 0;
  for (const char *cursor = text; cursor < end; ++cursor) {
    if (!isdigit(static_cast<unsigned char>(*cursor))) return false;
    const uint8_t digit = static_cast<uint8_t>(*cursor - '0');
    if (parsed > (10000U - digit) / 10U) return false;
    parsed = parsed * 10U + digit;
  }
  if (parsed < 1U) return false;
  value = static_cast<uint16_t>(parsed);
  return true;
}

bool parseCommand(char *line, float &intensity, uint16_t &duration, bool &buzzOn) {
  constexpr char PREFIX[] = "DO_SHOCK ";
  if (strncmp(line, PREFIX, sizeof(PREFIX) - 1) != 0) return false;

  char *intensityText = line + sizeof(PREFIX) - 1;
  char *firstSpace = strchr(intensityText, ' ');
  if (!firstSpace || firstSpace == intensityText) return false;
  char *durationText = firstSpace + 1;
  char *secondSpace = strchr(durationText, ' ');
  if (!secondSpace || secondSpace == durationText) return false;
  char *buzzText = secondSpace + 1;
  if ((buzzText[0] != '0' && buzzText[0] != '1') || buzzText[1] != '\0') return false;

  uint16_t parsedDuration;
  if (!parseIntensity(intensityText, firstSpace, intensity) ||
      !parseDuration(durationText, secondSpace, parsedDuration)) return false;

  duration = parsedDuration;
  buzzOn = buzzText[0] == '1';
  return true;
}

void performShock(float intensity, uint16_t duration, bool buzzOn) {
  const uint8_t brightness = static_cast<uint8_t>(intensity * 255.0f + 0.5f);
  FastLED.setBrightness(brightness);
  fill_solid(leds, NUM_LEDS, CRGB::Red);
  FastLED.show();
  if (buzzOn) tone(BUZZER_PIN, BUZZER_FREQUENCY);

  delay(duration);

  fill_solid(leds, NUM_LEDS, CRGB::Black);
  FastLED.show();
  noTone(BUZZER_PIN);
}

void processLine() {
  inputBuffer[inputLength] = '\0';
  float intensity;
  uint16_t duration;
  bool buzzOn;
  if (parseCommand(inputBuffer, intensity, duration, buzzOn)) {
    Serial.println(F("ACK DO_SHOCK"));
    performShock(intensity, duration, buzzOn);
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER_PIN, OUTPUT);
  FastLED.addLeds<WS2812B, LED_DATA_PIN, GRB>(leds, NUM_LEDS);
  fill_solid(leds, NUM_LEDS, CRGB::Black);
  FastLED.show();
  noTone(BUZZER_PIN);
}

void loop() {
  while (Serial.available() > 0) {
    const char incoming = static_cast<char>(Serial.read());
    if (incoming == '\n') {
      if (!discardingLine) processLine();
      inputLength = 0;
      discardingLine = false;
    } else if (!discardingLine) {
      if (inputLength < INPUT_BUFFER_SIZE - 1) {
        inputBuffer[inputLength++] = incoming;
      } else {
        inputLength = 0;
        discardingLine = true;
      }
    }
  }
}
