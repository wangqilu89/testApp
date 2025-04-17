import { View, Text, Button, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { postFunc, GetPostOptions } from '../services/common'; // your service function

export default function DashboardScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // ✅ Loading state

  useEffect(() => {
    let isMounted = true;

    const checkLoginStatus = async () => {
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          var data = await postFunc('https://testapp-capl.onrender.com/auth/status',{})
          if (data.loggedIn) {
            var result = await postFunc('https://testapp-capl.onrender.com/netsuite/send',GetPostOptions({restlet:'http://www.netsuite.com',command: 'Get User'}));
            if (result?.userId) {
              if (!isMounted) return;
              setUserId(result.userId);
              await AsyncStorage.setItem('userId', result.userId);
              setIsLoading(false); // ✅ Stop loading
              return;
            } else {
              console.warn('Login check failed: User ID not found.');
              break;
            }
          }
        } catch (err) {
          console.warn('Login status check failed:', err);
        }

        await new Promise((res) => setTimeout(res, 500));
      }

      if (isMounted) {
        router.replace('/'); // Redirect to login
      }
    };

    checkLoginStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    // ✅ Show loading spinner while checking auth
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 20 }}>Checking authentication...</Text>
      </View>
    );
  }

  // ✅ Only show dashboard when loading is finished
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Welcome {userId ? `User ${userId}` : 'Guest'}
      </Text>

      <View style={{ gap: 12 }}>
        <Button title="📝 Apply Leave" onPress={() => alert('Leave screen placeholder')} />
        <Button title="✅ Approve Transactions" onPress={() => alert('Approve screen placeholder')} />
        <Button title="📦 Submit Transactions" onPress={() => alert('Submit screen placeholder')} />
      </View>
    </View>
  );
}