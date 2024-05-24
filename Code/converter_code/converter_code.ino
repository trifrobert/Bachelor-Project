#include <Wire.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Adafruit_INA219.h>
#include <driver/adc.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

#define temperature_s1 34   //pin for the first temperature sensor; corresponds to GPI34
#define temperature_s2 35   //pin for the second temperature sensor; corresponds to GPIO35

#define FIREBASE_HOST "https://esp32-car-data-default-rtdb.firebaseio.com/"
#define FIREBASE_AUTH "AIzaSyBJsdj8P2ekGtWMlMJq_197awK2xiOnvUE"

#define WIFI_SSID "DIGI_e98047"
#define WIFI_PASSWORD "f04eaec7"

// Wi-Fi and Realtime Database Connection
WiFiClient wifiClient;
FirebaseData firebaseData;
FirebaseAuth auth;
FirebaseConfig config;
bool signupOK = false;
int lastSendTime = 0;

Adafruit_INA219 ina_219;  // instance of current module
float expected_voltage = 2;   // Volts
float input_voltage = 0;    // Volts
float iBatt = 0;  // mAmpers
float vBatt = 0;    // Volts

const int PWM = 23;   // corresponds to GPIO23
const int pwm_channel = 6;
const int freqency = 30000;   // Hz
const int resolution = 8;
int pwm = 255;

// motor driver configuration
int motorspeed_l = 33;
int leftMotors_pin1 = 25;
int leftMotors_pin2 = 26;
int rightMotors_pin1 = 27;
int rightMotors_pin2 = 14;
int motorspeed_r = 12;

// access for Dallas temperature sensors
OneWire oneWire_s1(temperature_s1);
OneWire oneWire_s2(temperature_s2);
DallasTemperature sensor1(&oneWire_s1);
DallasTemperature sensor2(&oneWire_s2);
float temperature_batt1 = 0;
float temperature_batt2 = 0;

const float divider_ratio = 0.2985;   // Voltage divider ratio based on resistances value: 10 / (23.5 + 10)

float get_input_voltage(int n_samples, float ref_v) {
  float voltage = 0.0;

  for (int i = 0; i < n_samples; i++) {
    int raw_adc = adc1_get_raw(ADC1_CHANNEL_0);  // Read the raw ADC value from channel 0, GPIO36
    voltage += (raw_adc * ref_v / 4095.0) / divider_ratio;
  }
  voltage = voltage / n_samples;
  return voltage;
}

void connectToWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.println("Connecting...");
    delay(100);
  }
  Serial.println("\nConnected to WiFi");
}

void connectToFirebase() {
  config.api_key = FIREBASE_AUTH;
  config.database_url = FIREBASE_HOST;
  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("Connection established!");
    signupOK = true;
  } else {
    Serial.printf("%s\n", config.signer.signupError.message.c_str());
  }

  config.token_status_callback = tokenStatusCallback; // see addons/TokenHelper.h

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void printData(void) {
  Serial.print("PWM Value: ");
  Serial.println(pwm);
  Serial.print("Input voltage:         "); Serial.print(input_voltage); Serial.println(" V");
  Serial.print("Battery Voltage:       "); Serial.print(vBatt); Serial.println(" V");
  Serial.print("Charging Current:      "); Serial.print(iBatt); Serial.println(" mA");
  Serial.print("Battery 1 Temperature: "); Serial.print(temperature_batt1); Serial.println(" *C");
  Serial.print("Battery 2 Temperature: "); Serial.print(temperature_batt2); Serial.println(" *C");
  Serial.println();
}

void setup() {
  Serial.begin(115200);

  connectToWiFi();
  connectToFirebase();

  pinMode(leftMotors_pin1, OUTPUT);
  pinMode(leftMotors_pin2, OUTPUT);
  pinMode(rightMotors_pin1, OUTPUT);
  pinMode(rightMotors_pin2, OUTPUT);
  pinMode(motorspeed_l, OUTPUT);  // controls the left motor speed - range(0, 255)
  pinMode(motorspeed_r, OUTPUT);  // controls the right motor speed - range(0, 255)

  adc1_config_width(ADC_WIDTH_BIT_12);  // Set ADC resolution to 12 bits
  adc1_config_channel_atten(ADC1_CHANNEL_0, ADC_ATTEN_DB_11);  // Set attenuation to 11dB for 0-3.6V range

  ledcSetup(pwm_channel, freqency, resolution);
  ledcAttachPin(PWM, pwm_channel);

  sensor1.begin();
  sensor2.begin();

  while (!ina_219.begin()) {
    Serial.print("Failed to find module ina_219!");
    delay(1000);
  }
  ina_219.setCalibration_32V_2A();
  Serial.println("Measuring voltage and current with the two INA219 modules...");
}

void loop() {
  input_voltage = get_input_voltage(10, 3.3);
  iBatt = ina_219.getCurrent_mA();
  vBatt = ina_219.getBusVoltage_V() + (ina_219.getShuntVoltage_mV() / 1000);

  // sensor1.requestTemperatures();
  // sensor2.requestTemperatures();
  temperature_batt1 = sensor1.getTempCByIndex(0);
  temperature_batt2 = sensor2.getTempCByIndex(0);

  if (expected_voltage > vBatt) {
    pwm = pwm - 1;
    pwm = constrain(pwm, 0, 254);
  }

  if (expected_voltage < vBatt) {
    pwm = pwm + 1;
    pwm = constrain(pwm, 0, 254);
  }
  ledcWrite(pwm_channel, pwm);

  if (Firebase.ready() && signupOK && (millis() - lastSendTime > 15000 || lastSendTime == 0)) {
    lastSendTime = millis();
    Firebase.RTDB.setFloat(&firebaseData, "/input_voltage", input_voltage);
    Firebase.RTDB.setFloat(&firebaseData, "/iBatt", iBatt);
    Firebase.RTDB.setFloat(&firebaseData, "/vBatt", vBatt);
    Firebase.RTDB.setFloat(&firebaseData, "/tBatt1", temperature_batt1);
    Firebase.RTDB.setFloat(&firebaseData, "/tBatt2", temperature_batt2);
  } else {
    Serial.println("Firebase not ready!");
  }

  // digitalWrite(leftMotors_pin1, LOW);
  // digitalWrite(leftMotors_pin2, HIGH);

  // digitalWrite(rightMotors_pin1, HIGH);
  // digitalWrite(rightMotors_pin2, LOW);

  // digitalWrite(motorspeed_l, HIGH);
  // digitalWrite(motorspeed_r, HIGH);

  printData();
  delay(100);
}
