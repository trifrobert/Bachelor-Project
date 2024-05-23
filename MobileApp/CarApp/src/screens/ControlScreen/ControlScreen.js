import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import React from 'react';

const ControlScreen = () => {
  const handlePress = (direction) => {
    // Handle button press for each direction
    console.log(`Pressed ${direction} button`);
    // You can implement logic to send commands to the car based on the direction
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../../assets/images/background.jpg')} style={styles.backgroundImage} />

      <View style={styles.overlay}>
        <View style={styles.controls}>
          {/* First Row: Up Button */}
          <View style={styles.row}>
            <View style={styles.emptySpace} />
            <TouchableOpacity style={[styles.button, styles.upButton]} onPress={() => handlePress('up')}>
              <Image source={require('../../../assets/images/arrow.png')} style={styles.buttonImage} />
            </TouchableOpacity>
            <View style={styles.emptySpace} />
          </View>

          {/* Second Row: Left and Right Buttons */}
          <View style={styles.row}>
            <TouchableOpacity style={[styles.button, styles.leftButton]} onPress={() => handlePress('left')}>
              <Image source={require('../../../assets/images/arrow.png')} style={styles.buttonImage} />
            </TouchableOpacity>
            <View style={styles.emptySpace} />
            <TouchableOpacity style={[styles.button, styles.rightButton]} onPress={() => handlePress('right')}>
              <Image source={require('../../../assets/images/arrow.png')} style={styles.buttonImage} />
            </TouchableOpacity>
          </View>

          {/* Third Row: Down Button */}
          <View style={styles.row}>
            <View style={styles.emptySpace} />
            <TouchableOpacity style={[styles.button, styles.downButton]} onPress={() => handlePress('down')}>
              <Image source={require('../../../assets/images/arrow.png')} style={styles.buttonImage} />
            </TouchableOpacity>
            <View style={styles.emptySpace} />
          </View>
        </View>
      </View>
    </View>
  );
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
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
