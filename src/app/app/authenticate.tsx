import { useEffect } from 'react';
import { View, Text, ActivityIndicator, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';

export default function AuthenticateScreen() {
  const router = useRouter();

  useEffect(() => {
    const authenticate = async () => {
      const redirectUri = 'myapp://auth/callback';
      const platform = Platform.OS === 'web' ? 'web' : 'mobile';
      const authUrl = `https://testapp-capl.onrender.com/auth/start?platform=${platform}`;

      if (Platform.OS === 'web') {
        const authWindow = window.open(authUrl, '_blank', 'width=600,height=700');

        const handleMessage = (event: any) => {
          if (event.origin !== 'https://testapp-capl.onrender.com') return;
          if (event.data === 'auth-success') {
            window.removeEventListener('message', handleMessage);
            router.replace('/home'); // ✅ move to dashboard
          }
        };

        window.addEventListener('message', handleMessage);

        return () => {
          window.removeEventListener('message', handleMessage);
        };
      } else {
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
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Authenticating with NetSuite...</Text>
      <ActivityIndicator size="large" style={{ marginTop: 20 }} />
    </View>
  );
}