import { View, Text} from 'react-native';
import { Tabs } from 'expo-router';
import React from 'react';


import { useWebCheck} from '@/services'; // 👈 update path
import { HapticTab } from '@/components/HapticTab';
import { Ionicons } from '@expo/vector-icons';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { UserProvider, useUser} from '@/services'; 


export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isWeb = !useWebCheck();
  const { user } = useUser();
  return (
      <UserProvider>
        <View style={{ flex: 1 }}>
          
        {/* Top User Banner */}
        {isWeb && (
          <View style={{
            borderTopWidth: 4,
            borderTopColor: '#004C6C',
            padding: 10,
            backgroundColor: '#f8f8f8',
            alignItems: 'center',
          }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
              Welcome, {user?.name ?? 'Guest'}
            </Text>
            <Text style={{ fontSize: 14, color: 'gray' }}>
              Department: Sales
            </Text>
          </View>
        )}

        {/* Tabs content */}
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
      </View>
    </UserProvider>
  );
}
