import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import Joystick from '../../components/Joystick';
import CustomButton from '../../components/CustomButton/CustomButton';
import { useNavigation } from '@react-navigation/native';
import { db } from '../../../firebase';
import { ref, set } from 'firebase/database'; 

const ControlScreen = () => {
  const navigation = useNavigation();

  // State to track which buttons are pressed
  const [controlState, setControlState] = useState({
    up: 0,
    down: 0,
    left: 0,
    right: 0,
  });

  // State for suggestive messages
  const [message, setMessage] = useState('Use the joystick in order to move the car');

  // State to track whether the joystick has been used
  const [joystickUsed, setJoystickUsed] = useState(false);

  useEffect(() => {
    console.log('controlState changed:', controlState);

    // Update the database whenever controlState changes
    Object.keys(controlState).forEach((key) => {
      console.log(`Updating control_${key} to`, controlState[key]);
      set(ref(db, `controls/control_${key}`), controlState[key]);
    });

    // Update suggestive message based on controlState
    const messages = [];
    if (controlState.up) messages.push('Up');
    if (controlState.down) messages.push('Down');
    if (controlState.left) messages.push('Left');
    if (controlState.right) messages.push('Right');

    // If the joystick has been used, remove the initial message
    if (joystickUsed) {
      setMessage(messages.join('-'));
    }
  }, [controlState, joystickUsed]);

  const onBackPressed = () => {
    navigation.navigate('MainScreen');
  };

  const handleJoystickMove = ({ x, y }) => {
    const threshold = 0.5;

    const newControlState = {
      up: y > threshold ? 1 : 0,
      down: y < -threshold ? 1 : 0,
      left: x < -threshold ? 1 : 0,
      right: x > threshold ? 1 : 0,
    };

    setControlState(newControlState);
    setJoystickUsed(true); // Set joystickUsed to true when joystick is moved
    setMessage(''); // Clear initial message when joystick is moved
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../../assets/images/background.jpg')} style={styles.backgroundImage} />

      <View style={styles.overlay}>
        <View style={styles.controls}>
          <Joystick
            size={150}
            onMove={handleJoystickMove}
            onStop={() => setControlState({ up: 0, down: 0, left: 0, right: 0 })}
          />
          <Text style={styles.message}>{message}</Text>
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
      </View>
    </View>
  );
};

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
  controls: {
    width: '100%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center', // Center the joystick
  },
  message: {
    marginTop: 20,
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
  },
});

export default ControlScreen;
