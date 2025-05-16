import { View, Text, ActivityIndicator,Platform, Dimensions, FlatList, TouchableOpacity,ViewStyle,TextStyle,StyleSheet} from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons'; 
import { WebView } from 'react-native-webview';
import Autocomplete from 'react-native-autocomplete-input';
import { FetchData} from '@/services'; 
import {useThemedStyles} from '@/styles';

type SubMenu = {
  id:string,
  title:string,
  icon:string
}
type Command = {
  command:string,
  user:string,
  restlet:string,
  middleware:string,
  [key: string]: any;
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
      <Text style={[Header.text,ReactTag.text]}>{txt}</Text>
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

const NoRecords = () => {
  const {Page,Header} = useThemedStyles()
  return (
    <View style={[Page.container]}>
        <Text style={[Header.textReverse]}>No records found.</Text>
      </View>
  )
}

const MainViewer = ({url,doc}:{url:string,doc:string}) => {
  const {Page,Header} = useThemedStyles()
  const router = useRouter();
  useEffect(() => {
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
      router.back(); // 👈 optional: go back after opening
    }
  }, []);

  if (Platform.OS === 'web') {
    return null; // or just let useEffect handle everything
  }
  return (
    <View style={[Page.container]}>
      <TouchableOpacity onPress={() => router.back()} style={[Header.container]}>
        <View style={[Header.view,{flex:-1,width:20}]}><Ionicons name='chevron-back-outline' style={[Header.text,{width:20}]}/></View>

        <Text style={[Header.text,{flex:1}]}>{doc}</Text>
      </TouchableOpacity>
      <WebView source={{ uri: url }} startInLoadingState renderLoading={() => (<ActivityIndicator size="large" style={{ marginTop: 100 }} />)}/>
    </View>
  )

}

const FilterDropdown = ({command,onSelect,style}: {command:Command,onSelect: (item: any) => void,style?: ViewStyle & TextStyle}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  
  const loadDropdown = async (q: string) => {
      setQuery(q);
      if (q.length < 2) {
        setResults([]);
        return;
      }
      
      try {
        const data = await FetchData({...command,keyword:q});
        setResults(data);
      } catch (err) {
        console.error(err);
      } 
  };
  return (
    <Autocomplete inputContainerStyle={StyleSheet.flatten(style)} data={results} defaultValue={query} onChangeText={loadDropdown} 
      flatListProps={{
        keyExtractor: (_, idx) => idx.toString(),
        renderItem: ({ item }) => (
          <TouchableOpacity onPress={() => { setQuery(item.name); onSelect(item); setResults([]); }}>
            <Text style={{ padding: 8 }}>{item.name}</Text>
          </TouchableOpacity>
        )
      }}
    />
  )
}



export {
  useWebCheck,
  LoadingScreen,
  MainPage,
  NoRecords,
  MainViewer,
  FilterDropdown
};