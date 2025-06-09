import { View, Text} from 'react-native';
import {  useUser,LoadingScreen} from '@/services'; // 👈 update path
import { useThemedStyles } from '@/styles';

export default function HomeScreen() {
  
  const { user, loading } = useUser(); // ✅ Pull from context
  const {Page,ReactTag,Header} = useThemedStyles()
  
  return (

    <View style={[Page.container]}>
      {loading && (<LoadingScreen txt="Checking authentication..."/>)}
      <Text style={[ReactTag.text,Header.textReverse,{marginBottom: 20 }]}> {user ? `Welcome ${user.name}` : ''}</Text>
      {/* Example logout button */}
      {/* <Button title="Logout" onPress={logout} /> */}
    </View>

  );
}