import { Slot } from 'expo-router';

import { UserProvider } from '@/services'; // Adjust path as needed

export default function AuthenticatedLayout() {
  return (
    <UserProvider>
      <Slot />
    </UserProvider>
  );
}