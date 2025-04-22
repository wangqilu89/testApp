
import { Tabs } from 'expo-router';
import React from 'react';


import { useWebCheck} from '@/services'; // 👈 update path
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { UserProvider, useUser} from '@/services'; 


export default function TabLayout() {
   
  return (
    <UserProvider>
      <InnerTabs />
    </UserProvider>
  );
}

const InnerTabs = () => {
  const { user } = useUser(); // ✅ Now safe because wrapped by UserProvider
  const colorScheme = useColorScheme();
  const isWeb = useWebCheck();
  return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: isWeb ? { display: 'none' } : { position: 'absolute' },
        }}
      >
        <Tabs.Screen name="home" options={{ title: 'Home' }} />
        <Tabs.Screen name="hr-main" options={{ title: 'HR' }} />
        <Tabs.Screen name="approve-main" options={{ title: 'Approve' }} />
        <Tabs.Screen name="resource-main" options={{ title: 'Resources' }} />
        <Tabs.Screen name="more-main" options={{ title: 'More' }} />
      </Tabs>
  );
}
