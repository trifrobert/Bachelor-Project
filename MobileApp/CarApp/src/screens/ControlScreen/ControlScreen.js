import { StyleSheet, View, Image, Text, TouchableOpacity } from 'react-native';
import CustomButton from '../../components/CustomButton/CustomButton';
import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase'; // Import your Firebase configuration
import { ref, set } from 'firebase/database'; // Ensure you import 'set' from 'firebase/database'

const ControlScreen = () => {
  const navigation = useNavigation();

  // State to track which buttons are pressed
  const [controlState, setControlState] = useState({
    up: 0,
    down: 0,
    left: 0,
    right: 0,
  });

  useEffect(() => {
    // Log the current control state
    console.log('controlState changed:', controlState);

    // Update the database whenever controlState changes
    Object.keys(controlState).forEach((key) => {
      console.log(`Updating control_${key} to`, controlState[key]);
      set(ref(db, `controls/control_${key}`), controlState[key]);
    });
  }, [controlState]);

  const onBackPressed = () => {
    navigation.navigate('MainScreen');
  };

  const handlePressIn = (direction) => {
    console.log(`Press in: ${direction}`);
    setControlState((prevState) => ({ ...prevState, [direction]: 1 }));
  };

  const handlePressOut = (direction) => {
    console.log(`Press out: ${direction}`);
    setControlState((prevState) => ({ ...prevState, [direction]: 0 }));
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../../assets/images/background.jpg')} style={styles.backgroundImage} />

      <View style={styles.overlay}>
        <View style={styles.controls}>
          {/* First Row: Up Button */}
          <View style={styles.row}>
            <View style={styles.emptySpace} />
            <View
              style={[styles.button, styles.upButton]}
              onStartShouldSetResponder={() => true}
              onResponderGrant={() => handlePressIn('up')}
              onResponderRelease={() => handlePressOut('up')}
            >
              <Image source={require('../../../assets/images/arrow.png')} style={styles.buttonImage} />
            </View>
            <View style={styles.emptySpace} />
          </View>

          {/* Second Row: Left and Right Buttons */}
          <View style={styles.row}>
            <View
              style={[styles.button, styles.leftButton]}
              onStartShouldSetResponder={() => true}
              onResponderGrant={() => handlePressIn('left')}
              onResponderRelease={() => handlePressOut('left')}
            >
              <Image source={require('../../../assets/images/arrow.png')} style={styles.buttonImage} />
            </View>
            <View style={styles.emptySpace} />
            <View
              style={[styles.button, styles.rightButton]}
              onStartShouldSetResponder={() => true}
              onResponderGrant={() => handlePressIn('right')}
              onResponderRelease={() => handlePressOut('right')}
            >
              <Image source={require('../../../assets/images/arrow.png')} style={styles.buttonImage} />
            </View>
          </View>

          {/* Third Row: Down Button */}
          <View style={styles.row}>
            <View style={styles.emptySpace} />
            <View
              style={[styles.button, styles.downButton]}
              onStartShouldSetResponder={() => true}
              onResponderGrant={() => handlePressIn('down')}
              onResponderRelease={() => handlePressOut('down')}
            >
              <Image source={require('../../../assets/images/arrow.png')} style={styles.buttonImage} />
            </View>
            <View style={styles.emptySpace} />
          </View>
        </View>
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
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20, // Adjust as needed
  },
  button: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent black background
    height: 100, // Adjust as needed
    width: 100, // Adjust as needed
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50, // Makes the buttons circular
  },
  buttonImage: {
    width: 40, // Adjust width and height as needed
    height: 40,
    tintColor: 'white', // Make the arrow white
  },
  emptySpace: {
    flex: 1, // Takes up the remaining space in the row
  },
  upButton: {
    transform: [{ rotate: '270deg' }], // Rotate the image for up button
  },
  leftButton: {
    transform: [{ rotate: '180deg' }], // Rotate the image for left button
  },
  rightButton: {
    transform: [{ rotate: '0deg' }], // Rotate the image for right button
  },
  downButton: {
    transform: [{ rotate: '90deg' }], // Rotate the image for down button
  },
});

export default ControlScreen;
