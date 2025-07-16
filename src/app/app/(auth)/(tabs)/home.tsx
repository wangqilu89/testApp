import React from 'react';
import { View, Text} from 'react-native';
import { useUser } from '@/components/User';
import { ThemedStyles } from '@/styles';
import { ProjectSearchPage } from '@/services';


export default function HomeScreen() {
  const { user,BaseObj,ColorScheme } = useUser(); // ✅ Pull from context
  const {Page,ReactTag,Header} = ThemedStyles(ColorScheme)
  

  return (

    <View style={[Page.container]}>
      <ProjectSearchPage SearchObj={{...BaseObj,command:'Project : Get Project Listing'}} scheme={ColorScheme} >
        <Text style={[ReactTag.text,Header.textReverse,{marginBottom: 20 }]}> {user ? `Welcome ${user.name}` : ''}</Text>
      </ProjectSearchPage>
      {/* Example logout button */}
      {/* <Button title="Logout" onPress={logout} /> */}
    </View>

  );
}