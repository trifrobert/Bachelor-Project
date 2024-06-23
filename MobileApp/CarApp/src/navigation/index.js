import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
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
      <Stack.Navigator
        initialRouteName="MainScreen"
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          transitionSpec: {
            open: {
              animation: 'timing',
              config: {
                duration: 300,
              },
            },
            close: {
              animation: 'timing',
              config: {
                duration: 300,
              },
            },
          },
        }}
      >
        <Stack.Screen name="MainScreen" component={MainScreen} />
        <Stack.Screen name="ControlScreen" component={ControlScreen} />
        <Stack.Screen name="StatusScreen" component={StatusScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
