/*
 * SafeDrive AI - ESP32 Smart Drunk-Driving Detection & Telematics Firmware
 * Hardware Architecture:
 *  - ESP32 Microcontroller
 *  - MQ-3 Calibrated Automotive Alcohol Sensor (Analog Pin 36)
 *  - NEO-6M GPS Module (Serial2 UART RX=16, TX=17)
 *  - Relay Module (Starter Interlock - GPIO 26)
 *  - Piezo Buzzer (GPIO 25)
 *  - Status LEDs: Green (GPIO 18), Yellow (GPIO 19), Red (GPIO 21)
 *  - SOS Push Button (GPIO 34)
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <TinyGPS++.h>

const char* ssid = "WIFI_SSID_PLACEHOLDER";
const char* password = "WIFI_PASSWORD_PLACEHOLDER";
const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;
const char* device_id = "SD-GPS-001";

#define MQ3_PIN 36
#define RELAY_PIN 26
#define BUZZER_PIN 25
#define LED_GREEN 18
#define LED_YELLOW 19
#define LED_RED 21
#define SOS_BUTTON_PIN 34

WiFiClient espClient;
PubSubClient client(espClient);
TinyGPSPlus gps;
HardwareSerial SerialGPS(2);

const int SAMPLE_COUNT = 5;
float samples[SAMPLE_COUNT];
int sampleIndex = 0;

void setup() {
  Serial.begin(115200);
  SerialGPS.begin(9600, SERIAL_8N1, 16, 17);

  pinMode(MQ3_PIN, INPUT);
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_YELLOW, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(SOS_BUTTON_PIN, INPUT_PULLUP);

  digitalWrite(RELAY_PIN, HIGH); // START ALLOWED
  digitalWrite(LED_GREEN, HIGH);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }

  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    while (!client.connected()) {
      if (client.connect(device_id)) {
        client.subscribe("safedrive/+/cmd/#");
      } else {
        delay(2000);
      }
    }
  }
  client.loop();

  while (SerialGPS.available() > 0) {
    gps.encode(SerialGPS.read());
  }

  float rawADC = analogRead(MQ3_PIN);
  float bacValue = (rawADC / 4095.0) * 0.50;

  samples[sampleIndex] = bacValue;
  sampleIndex = (sampleIndex + 1) % SAMPLE_COUNT;

  float sum = 0;
  for (int i = 0; i < SAMPLE_COUNT; i++) sum += samples[i];
  float filteredBAC = sum / SAMPLE_COUNT;

  if (filteredBAC >= 0.20) {
    digitalWrite(RELAY_PIN, LOW); // BLOCK START
    digitalWrite(LED_RED, HIGH);
    digitalWrite(LED_GREEN, LOW);
    digitalWrite(LED_YELLOW, LOW);
    tone(BUZZER_PIN, 1000);

    String topic = "safedrive/" + String(device_id) + "/alcohol";
    String payload = "{\"deviceId\":\"" + String(device_id) + "\",\"reading\":" + String(filteredBAC) + ",\"status\":\"ALCOHOL_DETECTED\"}";
    client.publish(topic.c_str(), payload.c_str());
  } else {
    digitalWrite(RELAY_PIN, HIGH); // START ALLOWED
    digitalWrite(LED_GREEN, HIGH);
    digitalWrite(LED_RED, LOW);
    digitalWrite(LED_YELLOW, LOW);
    noTone(BUZZER_PIN);
  }

  static unsigned long lastPub = 0;
  if (millis() - lastPub > 3000) {
    lastPub = millis();
    String topic = "safedrive/" + String(device_id) + "/location";
    String payload = "{\"deviceId\":\"" + String(device_id) + "\",\"latitude\":" + String(gps.location.lat(), 6) + ",\"longitude\":" + String(gps.location.lng(), 6) + ",\"speed\":" + String(gps.speed.kmph()) + "}";
    client.publish(topic.c_str(), payload.c_str());
  }
}
