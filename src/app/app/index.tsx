import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import {SERVER_URL,LoadingScreen} from '@/services';


export default function IndexScreen() {
  

  const router = useRouter();

  useEffect(() => {
    const authenticate = async () => {
      const redirectUri = 'myapp://auth/callback';
      const platform = (Platform.OS === 'web' ? 'web' : 'mobile');
      console.log('SERVERURL:' + SERVER_URL)
      let authUrl = SERVER_URL + `/auth/start?platform=${platform}`
      if (Platform.OS === 'web') {
        // ✅ Web: full page redirect
        const origin = location.origin
        authUrl += `&origin=${encodeURIComponent(origin)}`
        location.href = authUrl;
      } 
      else {
        const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
        if (result.type === 'success') {
          router.replace('/home');
        } else {
          router.replace('/'); // fallback back to login
        }
      }
    };

    authenticate();
  }, []);

  return (
    <LoadingScreen txt="Authenticating with NetSuite..."/>
  );
}