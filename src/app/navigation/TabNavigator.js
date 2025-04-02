import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';

const Tab = createBottomTabNavigator();

// Dummy Screens for now
const Screen = ({ title }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>{title}</Text>
  </View>
);

export default function TabNavigator() {
  return null;
}

/*
export default function TabNavigator() {
  return (
    
    <Tab.Navigator>
      <Tab.Screen name="Leave" children={() => <Screen title="Apply Leave" />} />
      <Tab.Screen name="Approve" children={() => <Screen title="Approve Transactions" />} />
      <Tab.Screen name="Submit" children={() => <Screen title="Submit Transactions" />} />
      <Tab.Screen name="Profile" children={() => <Screen title="User Profile" />} />
      <Tab.Screen name="Settings" children={() => <Screen title="Settings" />} />
    </Tab.Navigator>
    
  );
}
  */