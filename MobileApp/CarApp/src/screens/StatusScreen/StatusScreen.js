import { StyleSheet, View, Image, Text } from 'react-native';
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
  const navigation = useNavigation();

  useEffect(() => {
    const data = ref(db);

    onValue(data, (snapshot) => {
      setInputVoltage(parseFloat(snapshot.val().input_voltage).toFixed(2));
      setIBatt(parseFloat(snapshot.val().iBatt).toFixed(2));
      setVBatt(parseFloat(snapshot.val().vBatt).toFixed(2));
      setTempBatt1(parseFloat(snapshot.val().tBatt1).toFixed(2));
      setTempBatt2(parseFloat(snapshot.val().tBatt2).toFixed(2));
    });
  }, [db]);

  const onBackPressed = () => {
    navigation.navigate('MainScreen');
  }
  
  return (
    <View style={styles.container}>
      <Image source={
        require('../../../assets/images/background.jpg')} 
        style={styles.backgroundImage} 
      />
      <View style={styles.overlay}>
        <Text style={styles.text}>Input Voltage: {inputVoltage} V; Battery Current: {iBatt} A; Battery Voltage: {vBatt} V</Text>
        <Text style={styles.text}>Battery 1 temperature: {tempBatt1} V; Battery 2 temperature: {tempBatt2} </Text>
        <CustomButton
          text="Back"
          onPress={onBackPressed}
          type="PRIMARY"
          bgColor="rgba(255, 255, 255, 0.9)"
          fgColor="black"
          width="80%"
          height={55}
          />
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
    resizeMode: 'cover', // Adjust the resizeMode as needed
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)', // Semi-transparent overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: "white",
  }
});

export default StatusScreen;
