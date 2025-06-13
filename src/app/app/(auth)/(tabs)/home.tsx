import React from 'react';
import { View, Text} from 'react-native';
import { useUser } from '@/components/User';
import { useThemedStyles } from '@/styles';

export default function HomeScreen() {
  const { user } = useUser(); // ✅ Pull from context
  const {Page,ReactTag,Header} = useThemedStyles()
  

  return (

    <View style={[Page.container]}>
      <Text style={[ReactTag.text,Header.textReverse,{marginBottom: 20 }]}> {user ? `Welcome ${user.name}` : ''}</Text>
      {/* Example logout button */}
      {/* <Button title="Logout" onPress={logout} /> */}
    </View>

  );
}