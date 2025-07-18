
import { useFonts } from 'expo-font';
import { Righteous_400Regular } from '@expo-google-fonts/righteous';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';




// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Righteous_400Regular
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
