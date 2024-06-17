import React from 'react';
import { StyleSheet, Text, View, ImageBackground, Alert, BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../../components/CustomButton/CustomButton';

const MainScreen = () => {
  const navigation = useNavigation();

  const onControlsPressed = () => {
    navigation.navigate('ControlScreen');
  };

  const onStatusPressed = () => {
    navigation.navigate('StatusScreen');
  };

  const exitApp = () => {
    Alert.alert(
      'Exit App',
      'Do you want to exit?',
      [
        {
          text: 'No',
          onPress: () => null,
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => BackHandler.exitApp(),
        },
      ],
      { cancelable: false }
    );
  };

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
              bgColor="rgba(255, 255, 255, 0.9)"
              fgColor="black"
              width="80%"
              height={55}
              marginVertical={5}
            />
            <CustomButton
              text="Status"
              onPress={onStatusPressed}
              type="PRIMARY"
              bgColor="rgba(255, 255, 255, 0.9)"
              fgColor="black"
              width="80%"
              height={55}
              marginVertical={5}
            />
            <CustomButton
              text="Exit"
              onPress={exitApp}
              type="PRIMARY"
              bgColor="rgba(255, 255, 255, 0.9)"
              fgColor="black"
              width="80%"
              height={55}
              marginVertical={5}
            />
          </View>
        </View>
      </ImageBackground>
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
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
  },
  titleContainer: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '35%',
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    height: '60%',
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default MainScreen;
