import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles';


export default function Dashboard() {
  const navigation = useNavigation();

  useEffect(() => {
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
      navigation.replace('Login');
    };

    checkLoginStatus();
  }, []);

  return (
    <View style={[styles.baseContainer]}>
      <Text style={[styles.heading]}>Welcome to NetSuite Dashboard</Text>

      <View style={[styles.buttonGroup]}>
        <Button title="📝 Apply Leave" onPress={() => navigation.navigate('Leave')} />
        <Button title="✅ Approve Transactions" onPress={() => navigation.navigate('Approve')} />
        <Button title="📦 Submit Transactions" onPress={() => navigation.navigate('Submit')} />
      </View>
    </View>
  );
}

