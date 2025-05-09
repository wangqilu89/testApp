import { View, Text} from 'react-native';
import {  useUser,LoadingScreen} from '@/services'; // 👈 update path
import { useThemedStyles } from '@/styles';

export default function HomeScreen() {
  
  const { user, loading } = useUser(); // ✅ Pull from context
  const {CommonItems,Header} = useThemedStyles()
  
  if (loading) {
    return (
      <LoadingScreen txt="Checking authentication..."/>
    );
  }

  return (
   
    <View style={[CommonItems.view,CommonItems.container]}>
      <Text style={[CommonItems.text,Header.text,{backgroundColor:'transparent',marginBottom: 20 }]}>Welcome {user ? `${user.name}` : 'Guest'}</Text>
      {/* Example logout button */}
      {/* <Button title="Logout" onPress={logout} /> */}
    </View>
    
  );
}