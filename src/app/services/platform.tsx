import { View, Text, ActivityIndicator,Platform, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons'; 

import {useThemedStyles} from '@/styles';

type SubMenu = {
  id:string,
  title:string,
  icon:string
}

const useWebCheck = () => {
  const getPlatformState = () => {return ((Platform.OS === 'web') &&  (Dimensions.get('window').width >= 768))}
  const [isWeb, setIsWeb] = useState(getPlatformState());
  useEffect(() => {
    const updateState = () => {
      setIsWeb(getPlatformState());
    };
    // Listen to window resize events
    const subscription = Dimensions.addEventListener('change', updateState);
    return () => subscription.remove?.(); // Remove listener cleanly
  }, []);
  
  return isWeb;
    
  
}; 
const LoadingScreen = ({txt}:{txt:string}) => {
  const {Page,Header,ReactTag} = useThemedStyles();
  return (
    <View style={[Page.container]}>
      <ActivityIndicator size="large" />
      <Text style={[ReactTag.text,Header.text,{backgroundColor:'transparent'}]}>{txt}</Text>
    </View>
  )
}


const MainPage = ({redirect,title,pages}:{redirect:string;title:string,pages:SubMenu[];}) => {
  const router = useRouter();
  const {Page,Header,ReactTag,CategoryButton} = useThemedStyles()
  const handlePress = (id: string) => {
    router.push(`/${redirect}?category=${id}` as any); // 👈 Route to dynamic approval page
  };

  return (
    <View style={[Page.container]}>
      <View style={[Header.container]}><Text style={[Header.text]}>{title}</Text></View>
      <FlatList style={[Page.listContainer]} data={pages} keyExtractor={(item) => item.id} 
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handlePress(item.id)} style={[CategoryButton.container]}>
              <View style={[{flex:-1,width:50,justifyContent:'flex-start'}]}><Ionicons name={item.icon as any} style={[CategoryButton.icon]}/></View>
              <View style={[{flex:1,justifyContent:'center'}]}><Text style={[CategoryButton.text]}>{item.title}</Text></View>
              <View style={[{flex:-1,width: 10,justifyContent:'flex-end'}]}><Ionicons name='chevron-forward-outline' style={[CategoryButton.icon]} /></View>
            </TouchableOpacity>
          )}
        />
    </View>
  );
}

export {
  useWebCheck,
  LoadingScreen,
  MainPage
};