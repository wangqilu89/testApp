import React from 'react';
import { View, Button } from 'react-native';

export default function Login({ navigation }) {
  const handleLogin = () => {
    navigation.navigate('Authenticate');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <Button title="Login with NetSuite" onPress={handleLogin} />
    </View>
  );
}