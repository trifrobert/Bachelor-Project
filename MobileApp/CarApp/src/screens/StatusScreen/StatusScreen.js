import { StyleSheet, View, Image, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../../components/CustomButton/CustomButton';
import React, { useEffect, useState } from 'react';
import { db, ref, onValue } from "../../../firebase";

const StatusScreen = () => {
  const [inputVoltage, setInputVoltage] = useState(0);
  const [iBatt, setIBatt] = useState(0);
  const [vBatt, setVBatt] = useState(0);
  const [tempBatt1, setTempBatt1] = useState(0);
  const [tempBatt2, setTempBatt2] = useState(0);
  const [state, setState] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    const data = ref(db, 'sensors');

    onValue(data, (snapshot) => {
      const sensorsData = snapshot.val();
      if (sensorsData) {
        setInputVoltage(parseFloat(sensorsData.input_voltage).toFixed(2));
        setIBatt(parseFloat(sensorsData.iBatt).toFixed(2));
        setVBatt(parseFloat(sensorsData.vBatt).toFixed(2));
        setTempBatt1(parseFloat(sensorsData.tBatt1).toFixed(2));
        setTempBatt2(parseFloat(sensorsData.tBatt2).toFixed(2));
        setState(sensorsData.charging ? "Charging" : "Not charging");
      }
    });
  }, [db]);

  const onBackPressed = () => {
    navigation.navigate('MainScreen');
  }

  const getState = (state) => {
    if (state === "Charging"){
      return require('../../../assets/images/arrow_up.png');
    } else {
      return require('../../../assets/images/arrow_down.png');
    }
  }

  const MAX_VOLTAGE = 9.2;
  const MIN_VOLTAGE = 6.0;

  const getBatteryPercentage = (voltage) => {
    const percentage = ((voltage - MIN_VOLTAGE) / (MAX_VOLTAGE - MIN_VOLTAGE)) * 100;
    return Math.min(100, Math.max(0, percentage)).toFixed(0);
  }

  const getBatteryImage = (voltage) => {
    const highChargeThreshold = MIN_VOLTAGE + (MAX_VOLTAGE - MIN_VOLTAGE) * 0.75;
    const mediumChargeThreshold = MIN_VOLTAGE + (MAX_VOLTAGE - MIN_VOLTAGE) * 0.5;
    const lowChargeThreshold = MIN_VOLTAGE + (MAX_VOLTAGE - MIN_VOLTAGE) * 0.25;

    if(voltage> highChargeThreshold){
      return require('../../../assets/images/batt4.png');
    }
    if (voltage > mediumChargeThreshold && voltage < highChargeThreshold) {
      return require('../../../assets/images/batt3.png');
    } 
    if (voltage > lowChargeThreshold && voltage < mediumChargeThreshold) {
      return require('../../../assets/images/batt2.png');
    } 
    if (voltage < lowChargeThreshold) {
      return require('../../../assets/images/batt1.png');
    } 
  }

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../../assets/images/background.jpg')} 
        style={styles.backgroundImage} 
      />
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.infoContainer}>
            <View style={[styles.info, styles.battery]}>
              <Text style={styles.title}>Battery Information</Text>
              <View style={styles.batteryStatus}>
                <Image source={getBatteryImage(vBatt)} style={styles.batteryIcon} />
                <Text style={styles.batteryText}>Charge Level: {getBatteryPercentage(vBatt)}%</Text>
              </View>
              <View style={styles.infoItem}>
                <Image source={require('../../../assets/images/polarity.png')} style={styles.icon} />
                <Text style={styles.text}>Battery Voltage: {vBatt} V</Text>
              </View>
              <View style={styles.infoItem}>
                <Image source={require('../../../assets/images/current.png')} style={styles.icon} />
                <Text style={styles.text}>Charging Current: {iBatt} A</Text>
              </View>
              <View style={styles.infoItem}>
                <Image source={getState(state)} style={styles.icon} />
                <Text style={styles.text}>State: {state}</Text>
              </View>
            </View>
            <View style={[styles.info, styles.source]}>
              <Text style={styles.title}>Input Source</Text>
              <View style={styles.infoItem}>
                <Image source={require('../../../assets/images/polarity.png')} style={styles.icon} />
                <Text style={styles.text}>Input Voltage: {inputVoltage} V</Text>
              </View>
            </View>
            <View style={[styles.info, styles.temperature]}>
              <Text style={styles.title}>Temperature</Text>
              <View style={styles.infoItem}>
                <Image source={require('../../../assets/images/temperature.png')} style={styles.icon} />
                <Text style={styles.text}>Battery 1: {tempBatt1} °C</Text>
              </View>
              <View style={styles.infoItem}>
                <Image source={require('../../../assets/images/temperature.png')} style={styles.icon} />
                <Text style={styles.text}>Battery 2: {tempBatt2} °C</Text>
              </View>
            </View>
          </View>
          <CustomButton
            text="Back"
            onPress={onBackPressed}
            type="PRIMARY"
            bgColor="rgba(255, 255, 255, 0.8)"
            fgColor="black"
            width="80%"
            height={55}
          />
        </ScrollView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
  },
  scrollContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  infoContainer: {
    width: "100%",
    alignItems: "center",
    marginTop:20,
  },
  info: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    width: "95%",
    marginVertical: 10,
    borderRadius: 20,
    padding: 20,
  },
  batteryStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
  },
  batteryIcon: {
    width: 70,
    height: 70,
    marginRight: 20,
    resizeMode: 'contain',
  },
  batteryText: {
    fontSize: 22,
    color: 'black',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
  },
  source: {
    justifyContent: 'center',
    margin: 5,
  },
  battery: {
    justifyContent: 'center',
    margin: 5,
  },
  temperature: {
    justifyContent: 'center',
    margin: 5,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical:10,
  },
  icon: {
    width: 35,
    height: 35,
    marginRight: 10,
    resizeMode: 'contain',
  },
  text: {
    fontSize: 18,
    color: 'black',
  },
});

export default StatusScreen;
