import { useEffect } from 'react';
import { Platform,View,Text, ActivityIndicator} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import {SERVER_URL} from '@/services';
import {ThemedStyles } from '@/styles';



export default function IndexScreen() {
  
  const {Page} = ThemedStyles('light')
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
  
  const LoadingScreen = ({txt}:{txt:string}) => {
    const {Page,Header,ReactTag} = ThemedStyles();
    return (
      <View style={[Page.loading]}>
        <ActivityIndicator size="large" />
        <Text style={[Header.text,ReactTag.text]}>{txt}</Text>
      </View>
    )
  }

  return (
    <View style={[Page.container]}>
      <LoadingScreen txt="Authenticating with NetSuite..."/>
    </View>
  );
}