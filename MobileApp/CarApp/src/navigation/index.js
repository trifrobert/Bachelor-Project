import React, { useEffect, useState } from 'react'
import { View, ActivityIndicator } from 'react-native';

import MainScreen from '../screens/MainScreen';
import ControlScreen from '../screens/ControlScreen/ControlScreen';
import StatusScreen from '../screens/StatusScreen/StatusScreen';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const Navigation = () => { 
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown : false}}>
          <>
            <Stack.Screen name='MainScreen' component={MainScreen}/>
            <Stack.Screen name='ControlScreen' component={ControlScreen}/>
            <Stack.Screen name='StatusScreen' component={StatusScreen}/>
          </>
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default Navigation