#include <Wire.h>
#include <Adafruit_INA219.h>


const int NUM_MODULES = 3;
int vIn = A0;  
int PWM = 3;
int pwm = 0;

Adafruit_INA219 modules[NUM_MODULES] = {
  Adafruit_INA219(0x40)
  // Adafruit_INA219(0x41)
};

float get_input_voltage(int n_samples){
  float voltage = 0;
  for(int i=0; i < n_samples; i++){
    voltage += (analogRead(vIn) * (5.0 / 1023.0) * 6.0);     
  }
  voltage = voltage/n_samples;
  return(voltage);
}

void setup() {

  pinMode(PWM, OUTPUT); 
  digitalWrite(PWM,HIGH); 
  TCCR2B = TCCR2B & B11111000 | B00000001;    // pin 3 and 11 PWM frequency of 31372.55 Hz
  
  Serial.begin(115200);
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

  float expected_value = 0.5;

  float input = get_input_voltage(10);
  float iBatt = modules[0].getCurrent_mA();
  float vBatt = modules[0].getBusVoltage_V() + (modules[0].getShuntVoltage_mV() / 1000);

  if (expected_value > vBatt){
    pwm = pwm-1;
    pwm = constrain(pwm, 1, 254);
  }

  if (expected_value < vBatt){
    pwm = pwm+1;
    pwm = constrain(pwm, 1, 254);
  }

  analogWrite(PWM,pwm);

  Serial.print("PWM Value: ");
  Serial.println(pwm);
  Serial.print("Input voltage:    "); Serial.print(input); Serial.println(" V");
  Serial.print("Battery Voltage:  "); Serial.print(vBatt); Serial.println(" V");
  Serial.print("Charging Current: "); Serial.print(iBatt); Serial.println(" mA");
  Serial.println();

  delay(100);
}