import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import * as screens from './screens';


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={screens.Login} />
        <Stack.Screen name="Authenticate" component={screens.Authenticate} />
        <Stack.Screen name="Dashboard" component={screens.Dashboard} />
        <Stack.Screen name="Leave" component={TabNavigator} />
        <Stack.Screen name="Approve" component={TabNavigator} />
        <Stack.Screen name="Submit" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 