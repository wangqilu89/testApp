import React from 'react';
import { View, Text,TouchableOpacity} from 'react-native';
import { useUser } from '@/components/User';
import { ThemedStyles } from '@/styles';
import { ProjectSearchPage } from '@/services';


export default function HomeScreen() {
  const { user,BaseObj,ColorScheme,logout } = useUser(); // ✅ Pull from context
  const {Page,ReactTag,Header} = ThemedStyles(ColorScheme)
  

  return (

    <View style={[Page.container]}>
      <ProjectSearchPage SearchObj={{...BaseObj,command:'Project : Get Project Listing'}} scheme={ColorScheme} >
        <Text style={[ReactTag.text,Header.textReverse,{marginBottom: 20 }]}> {user ? `Welcome ${user.name}` : ''}</Text>
        <TouchableOpacity onPress={() => logout()} style={{ backgroundColor: '#28a745',width:150,maxWidth:150,padding: 12,borderRadius: 8,marginBottom: 20, alignItems: 'center'}}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Logout</Text>
        </TouchableOpacity>
      </ProjectSearchPage>
      {/* Example logout button */}
      {/* <Button title="Logout" onPress={logout} /> */}
    </View>

  );
}