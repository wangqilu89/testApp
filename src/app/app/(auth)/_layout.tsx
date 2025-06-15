import { Slot } from 'expo-router';
import { PromptProvider } from '@/components/AlertModal';
import { UserProvider } from '@/components/User';


export default function AuthenticatedLayout() {
  return (
    <PromptProvider >
      <UserProvider>
        <Slot />
      </UserProvider>
    </PromptProvider >
  );
}