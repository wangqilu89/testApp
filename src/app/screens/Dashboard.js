import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles';


export default function Dashboard() {
  const navigation = useNavigation();

  useEffect(() => {
    let isMounted = true; // 👈 track if component is mounted
    const checkLoginStatus = async () => {
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          const res = await fetch('https://testapp-capl.onrender.com/auth/status', {
            credentials: 'include',
          });
          const data = await res.json();

          if (data.loggedIn) {
            return; // already on Dashboard
          }
        } catch (err) {
          console.warn('Login status check failed:', err);
        }

        await new Promise((res) => setTimeout(res, 500));
      }

      // If not logged in after retries, go to Login screen
      if (isMounted) {
        navigation.replace('Login');
      }
    };

    checkLoginStatus();
    return () => {
      isMounted = false; // cleanup on unmount
    };
  }, []);

  return (
    <View style={[styles.baseContainer]}>
      <Text style={[styles.heading]}>Welcome to NetSuite Dashboard</Text>

      <View style={[styles.buttonGroup]}>
        <Button title="📝 Apply Leave" onPress={() => alert('Leave screen placeholder')} />
        <Button title="✅ Approve Transactions" onPress={() => alert('Approve screen placeholder')} />
        <Button title="📦 Submit Transactions" onPress={() => alert('Submit screen placeholder')} />
      </View>
    </View>
  );
}

