import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainScreen from '../screens/MainScreen';
import ControlScreen from '../screens/ControlScreen';
import StatusScreen from '../screens/StatusScreen';

import * as Notifications from 'expo-notifications';


const Stack = createStackNavigator();

const Navigation = () => {

  const navigationRef = useRef(null);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (navigationRef.current && data) {
        navigationRef.current.navigate('StatusScreen');
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName="MainScreen">
        <Stack.Screen name="MainScreen" component={MainScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ControlScreen" component={ControlScreen} options={{ headerShown: false }} />
        <Stack.Screen name="StatusScreen" component={StatusScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
