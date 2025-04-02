import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles';

export default function Authenticate() {
  const navigation = useNavigation();

  useEffect(() => {
    switch (Platform.OS) {
      case 'web' :
        const authWindow = window.open(
          'https://testapp-capl.onrender.com/auth/start?platform=web',
          'netsuite-oauth',
          'width=600,height=700'
        );

        const handleMessage = (event) => {
          if (event.origin !== 'https://testapp-capl.onrender.com') return;

          if (event.data === 'auth-success') {
            window.removeEventListener('message', handleMessage);
            navigation.replace('Dashboard');
          }
        };

        window.addEventListener('message', handleMessage);

        return () => {
          window.removeEventListener('message', handleMessage);
        };
        
      case 'ios':
        
      case 'android' :
        // 📱 Mobile: use Expo WebBrowser + deep link
        const authenticateMobile = async () => {
          const redirectUri = 'myapp://auth/callback';
          const authUrl = 'https://testapp-capl.onrender.com/auth/start?platform=mobile';

          const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

          if (result.type === 'success') {
            navigation.replace('Dashboard');
          } 
          else {
            console.warn('Authentication failed or cancelled');
            navigation.replace('Login');
          }
        };

        authenticateMobile();
        break;

      default:
        console.warn('Unsupported platform:', Platform.OS);

    }
  }, []);
  
  return (
    <View style={[styles.baseContainer]}>
      <Text style={[styles.heading]}>Pending Authentication</Text>
      <Text style={[styles.subheading]}>Please complete the login in the browser window...</Text>
      <ActivityIndicator size="large" style={{ marginTop: 20 }} />
    </View>
  );
}
