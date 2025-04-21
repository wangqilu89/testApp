import { View, Text, Button, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { postFunc, GetPostOptions } from '../../services/common'; // 👈 update path

export default function HomeScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const checkLoginStatus = async () => {
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          const data = await postFunc('https://testapp-capl.onrender.com/auth/status', {});
        
            if (data?.userId && data.id !== 0) {
              if (!isMounted) return;
              await AsyncStorage.setItem('userSession', JSON.stringify(data));
              setIsLoading(false);
              return;
            } else {
              console.warn('Login check failed: User ID not found.');
              break;
            }
          
        } catch (err) {
          console.warn('Login status check failed:', err);
        }

        await new Promise((res) => setTimeout(res, 500));
      }

      if (isMounted) {
        router.replace('/'); // redirect back to login
      }
    };

    checkLoginStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
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
        Welcome {userId ? `User ${userId}` : 'Guest'}
      </Text>
    </View>
  );
}