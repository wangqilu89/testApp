import { Slot } from 'expo-router';
import { AlertProvider } from '@/components/AlertModal';
import { UserProvider } from '@/components/User';


export default function AuthenticatedLayout() {
  return (
    <AlertProvider>
      <UserProvider>
        <Slot />
      </UserProvider>
    </AlertProvider>
  );
}