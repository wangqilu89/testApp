import { View, Text, ActivityIndicator,Platform, Dimensions, FlatList, TouchableOpacity,Alert,Modal,Linking,Image,TextStyle,ViewStyle,TextInput} from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons'; 
import { WebView } from 'react-native-webview';
import {useThemedStyles} from '@/styles';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';


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

const AttachmentField =({ defaultValue,onChange,style}: { defaultValue?: {uri: string,name: string,type: string},onChange?:(item: any) => void,style?:TextStyle & ViewStyle})  => {
  const {CategoryButton} = useThemedStyles()
  const [prompt,setPrompt] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{uri: string;name: string;type: string;} | null>(null);
  const pickFrom = async(place:string): Promise<{uri: string;name: string;type: string;} | undefined> => {
    try {
      setPrompt(false);
      let newObj = {uri:'',name:'',type:''}
      switch (place) {
          case 'document': {
            const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
            if (result?.assets && result.assets.length > 0) {
              const file = result.assets[0];
              newObj = { uri: file.uri, name: file.name, type: file.mimeType ?? 'application/octet-stream' }
            }
          }
          break;

          case 'gallery': {
            const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
            
            if (status !== 'granted') {
              throw Error('Permission Needed');
            }
            
            const result = await ImagePicker.launchImageLibraryAsync({mediaTypes: ['images'],allowsEditing:true,quality: 1});

            if (!result.canceled) {
              const file = result.assets[0];
              newObj = { uri: file.uri, name: file.fileName ?? 'photo.jpg', type: file.type ?? 'image/jpeg' };

            }
          }
          break;

          case 'camera': {
            const {status} = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              throw Error('Permission Needed');
            }

            const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'],allowsEditing:true,quality: 1});

            if (!result.canceled) {
              const file = result.assets[0];
              newObj = { uri: file.uri, name: 'photo.jpg', type: file.type ?? 'image/jpeg' };
            }
          }
          break;

      }
      return newObj
    }
    catch (err:any) {
      Alert.alert(`Error on ${place}`,err.message)
    }
  }

  const openExternal = () => {
    if (uploadedFile?.uri) Linking.openURL(uploadedFile.uri);
  };

  useEffect(() => {
    if (defaultValue) {
      setUploadedFile(defaultValue);
    }
  }, [defaultValue]);

  return (
    <View style={{flexDirection:'column',flex:1}}>
      <TouchableOpacity style={[{flex:1,flexDirection:'row',paddingLeft:10,paddingTop:15,paddingBottom:15},style]} onPress={() => setPrompt(true)} >
      <Ionicons name='attach-outline' style={[CategoryButton.icon]}/><Text style={[style,{flex:1}]}>{uploadedFile ? 'Update Document or Image' : 'Upload Document or Image'}</Text>
      </TouchableOpacity>
      

      <Modal visible={prompt} animationType="slide" transparent={true} onRequestClose={() => setPrompt(false)}>
        <TouchableOpacity style={{flex: 1,justifyContent: 'flex-end',backgroundColor:'#a7adb280'}} activeOpacity={1} onPressOut={() => setPrompt(false)}>
          <View style={{padding: 20}}>
            <Text style={{backgroundColor:'transparent',color:'white',fontSize: 18,fontWeight: 'bold',marginBottom: 12,textAlign: 'center'}}>Choose Upload Source</Text>
            <View style={{borderRadius:20,backgroundColor: 'white'}}>
              <TouchableOpacity style={{paddingVertical: 12,borderBottomWidth: 1,borderBottomColor: '#ccc',alignItems:'center'}} onPress={async () => {const fileObj = await pickFrom('camera');if (fileObj) {setUploadedFile(fileObj);onChange?.(fileObj);};}}><Text style={{backgroundColor:'transparent',fontSize: 18,fontWeight: 'bold'}}>📷 Take Photo</Text></TouchableOpacity>
              <TouchableOpacity style={{paddingVertical: 12,borderBottomWidth: 1,borderBottomColor: '#ccc',alignItems:'center'}} onPress={async () => {const fileObj = await pickFrom('gallery');if (fileObj) {setUploadedFile(fileObj);onChange?.(fileObj);};}}><Text style={{backgroundColor:'transparent',fontSize: 18,fontWeight: 'bold'}}>🖼 Gallery</Text></TouchableOpacity>
              <TouchableOpacity style={{paddingVertical: 12,borderBottomWidth: 1,borderBottomColor: '#ccc',alignItems:'center'}} onPress={async () => {const fileObj = await pickFrom('document');if (fileObj) {setUploadedFile(fileObj);onChange?.(fileObj);};}}><Text style={{backgroundColor:'transparent',fontSize: 18,fontWeight: 'bold'}}>📄 Pick File</Text></TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
      {uploadedFile && (
          <TouchableOpacity style={[{flex:1},style]} onPress={openExternal}>
            {uploadedFile.type?.startsWith('image/')?
              (<Image source={{ uri: uploadedFile.uri }} style={{ width: 100, height: 100, marginTop: 8, borderRadius: 4 }}/>):
              (<Text style={[style]}>📎 {uploadedFile.name ?? 'Unnamed file'}</Text>)
            }
            
          </TouchableOpacity>
      )}
    </ View>
  );

}

const SearchField = ({search,onChange,style}:{search?:string,onChange?:(item: any) => void,style?:TextStyle & ViewStyle}) => {
  const {Page,Theme} = useThemedStyles()
  return (
  <View style={[Page.container,{height:'auto',justifyContent:'space-between',flexDirection:'row',paddingBottom:15}]}>
    <View style={{flex:1}}></View>
    <View style={{flex:1,borderWidth: 1, padding: 8, margin: 10,borderRadius: 20,flexDirection:'row',justifyContent:'space-between',backgroundColor:'transparent',borderColor:Theme.text}}>
      <View style={{width:30}}><Ionicons name="search" color={Theme.text} size={20} /></View>
      <TextInput value={search} onChangeText={onChange} placeholder="Search..." style={[{flex:1,color:Theme.text}]}/>
    </View>
  </View>
  )
}

export {
  useWebCheck,
  LoadingScreen,
  MainPage,
  NoRecords,
  MainViewer,
  AttachmentField,
  SearchField
};