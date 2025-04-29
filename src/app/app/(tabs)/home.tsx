import { View, Text, Button, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';

import {  useUser } from '@/services'; // 👈 update path

export default function HomeScreen() {
const { user, loading } = useUser(); // ✅ Pull from context

  
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 20 }}>Checking authentication...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Welcome {user ? `User ${user.name}` : 'Guest'}
      </Text>
      {/* Example logout button */}
      {/* <Button title="Logout" onPress={logout} /> */}
    </View>
  );
}