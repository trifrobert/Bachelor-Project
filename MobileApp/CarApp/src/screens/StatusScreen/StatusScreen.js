import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import CustomButton from '../../components/CustomButton/CustomButton';
import { useNavigation } from '@react-navigation/native'
import React from 'react'

const StatusScreen = () => {

  const navigation = useNavigation();
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
  }
});

export default StatusScreen