#include <Wire.h>
#include <Adafruit_INA219.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <driver/adc.h> 

Adafruit_INA219 ina_219;

#define temperature_s1 34 //pin for the first temperature sensor; corresponds to GPI36
#define temperature_s2 35 //pin for the second temperature sensor; corresponds to GPIO39

const int PWM = 23;   //corresponds to GPIO23
const int pwm_channel = 6;
const int freqency = 30000;   //Hz
const int resolution = 8;
int pwm = 255;

int motorspeed_l = 33;
int leftMotors_pin1 = 25;
int leftMotors_pin2 = 26;

int rightMotors_pin1 = 27;
int rightMotors_pin2 = 14;
int motorspeed_r = 12;

//access for Dallas temperature sensors
OneWire oneWire_s1(temperature_s1);
OneWire oneWire_s2(temperature_s2);   
DallasTemperature sensor1(&oneWire_s1);
DallasTemperature sensor2(&oneWire_s2);

const float divider_ratio = 0.2985;   // Voltage divider ratio based on resistences value: 10 / (23.5 + 10)

float get_input_voltage(int n_samples, float ref_v){
  float voltage = 0.0;
  
  for(int i=0; i < n_samples; i++){
    int raw_adc = adc1_get_raw(ADC1_CHANNEL_0);  // Read the raw ADC value from channel 3, GPIO39
    voltage += (raw_adc * ref_v / 4095.0) / divider_ratio;  
  }
  voltage = voltage/n_samples;
  return(voltage);
}

void setup() {

  pinMode(leftMotors_pin1, OUTPUT);
  pinMode(leftMotors_pin2, OUTPUT);
  pinMode(rightMotors_pin1, OUTPUT);
  pinMode(rightMotors_pin2, OUTPUT);

  pinMode(motorspeed_l, OUTPUT);  //controls the left motor speed - range(0, 255)
  pinMode(motorspeed_r, OUTPUT);  //controls the right motor speed - range(0, 255)

  adc1_config_width(ADC_WIDTH_BIT_12);  // Set ADC resolution to 12 bits
  adc1_config_channel_atten(ADC1_CHANNEL_0, ADC_ATTEN_DB_11);  // Set attenuation to 11dB for 0-3.6V range

  ledcSetup(pwm_channel, freqency, resolution);
  ledcAttachPin(PWM, pwm_channel);

  Serial.begin(115200);
  sensor1.begin();
  sensor2.begin();

  while (!Serial) {
      Serial.println("Serial connection failed!");
      delay(1000);
  }

  if (!ina_219.begin()) {
    Serial.print("Failed to find module ina_219!");
    while (1) {
      Serial.println("Stuck here!");
      delay(1000);
    }
  }
  ina_219.setCalibration_32V_2A();
  Serial.println("Measuring voltage and current with the two INA219 moudules...");
}

void loop() {  

  float expected_value = 2;
  float input = get_input_voltage(10, 3.3);
  float iBatt = ina_219.getCurrent_mA();
  float vBatt = ina_219.getBusVoltage_V() + (ina_219.getShuntVoltage_mV() / 1000);

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

  // digitalWrite(leftMotors_pin1, LOW);
  // digitalWrite(leftMotors_pin2, HIGH);

  // digitalWrite(rightMotors_pin1, HIGH);
  // digitalWrite(rightMotors_pin2, LOW);

  // digitalWrite(motorspeed_l, HIGH);
  // digitalWrite(motorspeed_r, HIGH);

  Serial.print("PWM Value: ");
  Serial.println(pwm);
  Serial.print("Input voltage:         "); Serial.print(input); Serial.println(" V");
  Serial.print("Battery Voltage:       "); Serial.print(vBatt); Serial.println(" V");
  Serial.print("Charging Current:      "); Serial.print(iBatt); Serial.println(" mA");
  Serial.print("Battery 1 Temperature: "); Serial.print(temperature_batt1); Serial.println(" *C");
  Serial.print("Battery 2 Temperature: "); Serial.print(temperature_batt2); Serial.println(" *C");
  Serial.println();

  delay(200);
}