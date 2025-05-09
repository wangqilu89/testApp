
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';



import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <>
      
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />         {/* Login */}
        <Stack.Screen name="authenticate" options={{ headerShown: false }} />  {/* OAuth */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />         {/* Tabs Group */}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    
    </>
  );
}
