import { View, Text} from 'react-native';
import {  useUser,LoadingScreen} from '@/services'; // 👈 update path
import { useThemedStyles } from '@/styles';

export default function HomeScreen() {
  
  const { user, loading } = useUser(); // ✅ Pull from context
  const {Page,ReactTag,Header} = useThemedStyles()
  
  if (loading) {
    return (
      <LoadingScreen txt="Checking authentication..."/>
    );
  }

  return (

    <View style={[Page.container]}>
      <Text style={[ReactTag.text,Header.textReverse,{marginBottom: 20 }]}>Welcome {user ? `${user.name}` : 'Guest'}</Text>
      {/* Example logout button */}
      {/* <Button title="Logout" onPress={logout} /> */}
    </View>

  );
}