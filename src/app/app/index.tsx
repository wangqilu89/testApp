import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function IndexScreen() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/authenticate');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Welcome to NetSuite App</Text>
      <Button title="Login to NetSuite" onPress={handleLogin} />
    </View>
  );
}