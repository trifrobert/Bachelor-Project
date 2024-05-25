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
FirebaseData data;
FirebaseAuth auth;
FirebaseConfig config;
bool signupOK = false;
unsigned long lastSendTime = 0;

Adafruit_INA219 ina_219;  // instance of current module
float expected_voltage = 2;   // Volts
float input_voltage = 0;    // Volts
float iBatt = 0;  // mAmpers
float vBatt = 0;    // Volts

const int PWM = 23;   // corresponds to GPIO23
const int pwm_channel = 6;
const int frequency = 30000;   // Hz
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

const char* control_keys[4] = {"/controls/control_up", "/controls/control_down", "/controls/control_left", "/controls/control_right"};
int control_values[4];

TaskHandle_t converterTaskHandle;
TaskHandle_t firebaseTaskHandle;
TaskHandle_t sensorTaskHandle;

float getInputVoltage(int n_samples, float ref_v) {
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

void handleControls(int control_arr[]){
  if(control_arr[0] == 1){
    if(control_arr[2] == 1){
      //FRONT-LEFT
      digitalWrite(leftMotors_pin1, LOW);
      digitalWrite(leftMotors_pin2, LOW);
      digitalWrite(rightMotors_pin1, HIGH);
      digitalWrite(rightMotors_pin2, LOW);
    }
    else if(control_arr[3] == 1){
      //FRONT-RIGHT
      digitalWrite(leftMotors_pin1, LOW);
      digitalWrite(leftMotors_pin2, HIGH);
      digitalWrite(rightMotors_pin1, LOW);
      digitalWrite(rightMotors_pin2, LOW);
    }
    else{
      //FRONT
      digitalWrite(leftMotors_pin1, LOW);
      digitalWrite(leftMotors_pin2, HIGH);
      digitalWrite(rightMotors_pin1, HIGH);
      digitalWrite(rightMotors_pin2, LOW);
    }
  }
  else if(control_arr[1] == 1){
    if(control_arr[2] == 1){
      //BACKWARD-LEFT
      digitalWrite(leftMotors_pin1, LOW);
      digitalWrite(leftMotors_pin2, LOW);
      digitalWrite(rightMotors_pin1, LOW);
      digitalWrite(rightMotors_pin2, HIGH);
    }
    else if(control_arr[3] == 1){
      //BACKWARD-RIGHT
      digitalWrite(leftMotors_pin1, HIGH);
      digitalWrite(leftMotors_pin2, LOW);
      digitalWrite(rightMotors_pin1, LOW);
      digitalWrite(rightMotors_pin2, LOW);
    }
    else{
      //BACKWARD
      digitalWrite(leftMotors_pin1, HIGH);
      digitalWrite(leftMotors_pin2, LOW);
      digitalWrite(rightMotors_pin1, LOW);
      digitalWrite(rightMotors_pin2, HIGH);
    }
  }
  else{
    //STATIONARY
    digitalWrite(leftMotors_pin1, LOW);
    digitalWrite(leftMotors_pin2, LOW);
    digitalWrite(rightMotors_pin1, LOW);
    digitalWrite(rightMotors_pin2, LOW);
  }
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

void converterTask(void *parameters){
  while(1){
    if (expected_voltage > vBatt) {
      pwm--;
      pwm = constrain(pwm, 0, 254);
    }

    if (expected_voltage < vBatt) {
      pwm++;
      pwm = constrain(pwm, 0, 254);
    }
    ledcWrite(pwm_channel, pwm);
    printData();
    vTaskDelay(pdMS_TO_TICKS(100));
  }
}

void sensorTask(void *parameters){
  while(1){
    input_voltage = getInputVoltage(10, 3.3);
    iBatt = ina_219.getCurrent_mA();
    vBatt = ina_219.getBusVoltage_V() + (ina_219.getShuntVoltage_mV() / 1000);

    temperature_batt1 = sensor1.getTempCByIndex(0);
    temperature_batt2 = sensor2.getTempCByIndex(0);

    // Change priorities based on input_voltage and vBatt
    if (input_voltage > 2) {
      vTaskPrioritySet(converterTaskHandle, 3); // Higher priority
      vTaskPrioritySet(firebaseTaskHandle, 1);  // Lower priority
    } else {
      vTaskPrioritySet(converterTaskHandle, 1); // Lower priority
      vTaskPrioritySet(firebaseTaskHandle, 3);  // Higher priority
    }
    vTaskDelay(pdMS_TO_TICKS(100));
  }
}

void firebaseTask(void *parameters){
  while(1){
    if (Firebase.ready() && signupOK) {
      // Sending data to Firebase
      if (millis() - lastSendTime > 5000 || lastSendTime == 0) {
        lastSendTime = millis();
        Firebase.RTDB.setFloat(&data, "/sensors/input_voltage", input_voltage);
        Firebase.RTDB.setFloat(&data, "/sensors/iBatt", iBatt);
        Firebase.RTDB.setFloat(&data, "/sensors/vBatt", vBatt);
        Firebase.RTDB.setFloat(&data, "/sensors/tBatt1", temperature_batt1);
        Firebase.RTDB.setFloat(&data, "/sensors/tBatt2", temperature_batt2);
      }

      // Receiving data from Firebase
      for (int i = 0; i < 4; i++) {
        if (Firebase.RTDB.getInt(&data, control_keys[i])) {
          if (data.dataType() == "int") {
            control_values[i] = data.intData();
          }
        }
      }
      handleControls(control_values);
    } else {
      Serial.println("Firebase not ready!");
    }
  }
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

  digitalWrite(motorspeed_l, HIGH);
  digitalWrite(motorspeed_r, HIGH);

  adc1_config_width(ADC_WIDTH_BIT_12);  // Set ADC resolution to 12 bits
  adc1_config_channel_atten(ADC1_CHANNEL_0, ADC_ATTEN_DB_11);  // Set attenuation to 11dB for 0-3.6V range

  ledcSetup(pwm_channel, frequency, resolution);
  ledcAttachPin(PWM, pwm_channel);

  sensor1.begin();
  sensor2.begin();

  while (!ina_219.begin()) {
    Serial.print("Failed to find module ina_219!");
    delay(1000);
  }
  ina_219.setCalibration_32V_2A();
  Serial.println("Measuring voltage and current with INA219 module...");

  xTaskCreatePinnedToCore(
    converterTask,      // Task function
    "PWM Control Task", // Name of the task
    4096,              // Stack size
    NULL,               // Task parameter
    1,                  // Priority
    &converterTaskHandle,// Task handle
    0                   // Core where the task should run
  );

  xTaskCreatePinnedToCore(
    sensorTask,              // Task function
    "Retrieve sensors data", // Name of the task
    4096,                   // Stack size
    NULL,                    // Task parameter
    2,                       // Priority
    &sensorTaskHandle,        // Task handle
    0                        // Core where the task should run
  );

  xTaskCreatePinnedToCore(
    firebaseTask,      // Task function
    "Firebase Task",   // Name of the task
    8192,             // Stack size 
    NULL,              // Task parameter
    1,                 // Priority
    &firebaseTaskHandle,// Task handle
    1                  // Core where the task should run
  );
}

void loop(void){
}
