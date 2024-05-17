#include <Wire.h>
#include <Adafruit_INA219.h>
#include <OneWire.h>
#include <DallasTemperature.h>

const int NUM_MODULES = 1;  //number of INA219 Modules

const int vIn = 32;   //corresponds to GPIO35
const int PWM = 33;   //corresponds to GPIO32
const int temperature_s1 = 25; //pin for the first temperature sensor; corresponds to GPIO32
const int temperature_s2 = 26; //pin for the second temperature sensor; corresponds to GPIO32

int pwm = 256;
const int pwm_channel = 0;
const int freqency = 10000;   //Hz
const int resolution = 8;

//access for Dallas temperature sensors
OneWire oneWire_s1(temperature_s1);
OneWire oneWire_s2(temperature_s2);   
DallasTemperature sensor1(&oneWire_s1);
DallasTemperature sensor2(&oneWire_s2);

Adafruit_INA219 modules[NUM_MODULES] = {
  Adafruit_INA219(0x40)
  // Adafruit_INA219(0x41)
};

float get_input_voltage(int n_samples, float peak_v){
  float voltage = 0.0;
  for(int i=0; i < n_samples; i++){
    voltage += analogRead(vIn) * peak_v / 4095.0;   
  }
  voltage = voltage/n_samples;
  return(voltage);
}

void setup() {

  ledcSetup(pwm_channel, freqency, resolution);
  ledcAttachPin(PWM, pwm_channel);
  
  Serial.begin(115200);
  sensor1.begin();
  sensor2.begin();

  while (!Serial) {
      Serial.println("Serial connection failed!");
      delay(1000);
  }

  for (int i = 0; i < NUM_MODULES; i++) {
    if (!modules[i].begin()) {
      Serial.print("Failed to find module "); Serial.println(i);
      while (1) {
        Serial.println("Stuck here!");
        delay(1000);
      }
    }
    modules[i].setCalibration_32V_2A();
  }
  Serial.println("Measuring voltage and current with the two INA219 moudules...");
}

void loop() {  

  float expected_value = 10;
  float input = get_input_voltage(10, 10);
  float iBatt = modules[0].getCurrent_mA();
  float vBatt = modules[0].getBusVoltage_V() + (modules[0].getShuntVoltage_mV() / 1000);

  sensor1.requestTemperatures();
  sensor2.requestTemperatures();
  float temperature_batt1 = sensor1.getTempCByIndex(0);
  float temperature_batt2 = sensor2.getTempCByIndex(0);

  if (expected_value > vBatt){
    pwm = pwm-1;
    pwm = constrain(pwm, 0, 254);
  }

  if (expected_value < vBatt){
    pwm = pwm+1;
    pwm = constrain(pwm, 0, 254);
  }

  ledcWrite(pwm_channel,pwm);

  Serial.print("PWM Value: ");
  Serial.println(pwm);
  Serial.print("Input voltage:       "); Serial.print(input); Serial.println(" V");
  Serial.print("Battery Voltage:     "); Serial.print(vBatt); Serial.println(" V");
  Serial.print("Charging Current:    "); Serial.print(iBatt); Serial.println(" mA");
  Serial.print("Battery 1 Temperature: "); Serial.print(temperature_batt1); Serial.println(" *C");
  Serial.print("Battery 2 Temperature: "); Serial.print(temperature_batt2); Serial.println(" *C");
  Serial.println();

  delay(100);
}