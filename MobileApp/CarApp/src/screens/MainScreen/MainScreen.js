import { StyleSheet, Text, View, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native'
import React from 'react';

import CustomButton from '../../components/CustomButton/CustomButton';

const MainScreen = () => {

  const navigation = useNavigation();

  const onControlsPressed = () => {
    navigation.navigate('ControlScreen');
  }

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={require('../../../assets/images/background.jpg')}
        style={styles.backgroundImage}
      >
        <View style={styles.overlay}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Your Electric Vehicle</Text>
          </View>
          <View style={styles.buttonContainer}>
            <CustomButton
              text="Controls"
              onPress={onControlsPressed}
              type="PRIMARY"
              bgColor="white"
              fgColor="black"
              width="80%" // Adjusted width to fill the entire container
              height="10%" // Adjusted height to take 50% of the container height
            />
            <CustomButton
              text="Status"
              type="PRIMARY"
              bgColor="white"
              fgColor="black"
              width="80%" // Adjusted width to fill the entire container
              height="10%" // Adjusted height to take 50% of the container height
            />
          </View>
        </View>
      </ImageBackground>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: "center",
    justifyContent: "center", // Added to center the title vertically
    flex: 4, // 40% of the screen
    width: "100%",
  },
  buttonContainer: {
    // backgroundColor:"white",
    alignItems:"center",
    flex: 6, // 60% of the screen
    width: "100%",
  },
  title: {
    fontSize: 35,
    paddingTop:"20%",
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
});

export default MainScreen;
