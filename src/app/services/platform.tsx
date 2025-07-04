import { View, Text, ActivityIndicator,Platform, Dimensions, FlatList, TouchableOpacity,Alert,Linking,Image,TextStyle,ViewStyle,TextInput} from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect,useMemo,useRef} from 'react';
import { Ionicons } from '@expo/vector-icons'; 
import { WebView } from 'react-native-webview';
import {useThemedStyles} from '@/styles';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import Modal from "react-native-modal";
import { GenericObject, KeyStyles, MenuOption,PageInfoColConfig,PageInfoRowProps } from '@/types';
import debounce from 'lodash.debounce';
import { useListFilter } from '@/hooks/useListFilter';
import { ProperCase } from '@/services';



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
    <View style={[Page.loading]}>
      <ActivityIndicator size="large" />
      <Text style={[Header.text,ReactTag.text]}>{txt}</Text>
    </View>
  )
}


const MainPage = ({redirect,title,pages}:{redirect:string;title:string,pages:MenuOption[];}) => {
  const router = useRouter();
  const {Page,Header,ReactTag,CategoryButton} = useThemedStyles()
  const handlePress = (id: string) => {
    router.push(`/${redirect}?category=${id}` as any); // 👈 Route to dynamic approval page
  };

  return (
    <View style={[Page.container]}>
      <View style={[Header.container]}><Text style={[Header.text]}>{title}</Text></View>
      <FlatList style={[Page.listContainer]} data={pages} keyExtractor={(item) => item.internalid} 
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handlePress(item.internalid)} style={[CategoryButton.container]}>
              <View style={[{flex:-1,width:50,justifyContent:'flex-start'}]}><Ionicons name={item.icon as any} style={[CategoryButton.icon]}/></View>
              <View style={[{flex:1,justifyContent:'center'}]}><Text style={[CategoryButton.text]}>{item.name}</Text></View>
              <View style={[{flex:-1,width: 10,justifyContent:'flex-end'}]}><Ionicons name='chevron-forward-outline' style={[CategoryButton.icon]} /></View>
            </TouchableOpacity>
          )}
        />
    </View>
  );
}

const ProjectSearchPage = ({SearchObj,children,HandleClose=null}:{SearchObj:GenericObject,children?: React.ReactNode,HandleClose?:(()=> void)|null}) => {
  const router = useRouter();
  const [openSearch,setOpenSearch] = useState(false);
  const NoRecordsStyle:GenericObject = {StyleContainer:{width:'100%',paddingBottom: 0,backgroundColor:'transparent'},StyleLabel:{textAlign: 'center',color:'black',fontSize: 14, fontWeight: 'bold'}}
  const {Listing,Form} = useThemedStyles()
  const COLUMN_CONFIG: PageInfoColConfig= [{internalid:'id',name:'Project Code'},{internalid:'name',name:'Project Name'},{internalid:'customer'}];
  const {list,displayList,search,setSearch,loading,UpdateLoad,LoadMore} = useListFilter({LoadModal:false,SearchObj:SearchObj,Enabled:true})
  
  
  const HandleSelect = (id: string) => {
    setOpenSearch(false);
    setSearch('');
    router.push(`/project?id=${id}` as any); 
  };
  
  const InfoRow = ({item,columns}:PageInfoRowProps) => {
    const newCol = useMemo(() => {
      return Array.isArray(columns)?columns:[];
    }, [columns]);
    

    return (
        <TouchableOpacity style={{backgroundColor:'transparent',flexDirection:'column',alignItems:'flex-start',width:'100%',marginTop:5,marginBottom:5,padding:8,flex:1,borderBottomWidth:1,borderBottomColor:'#cbcfd2'}} onPress={() => {HandleSelect(item.internalid);}}>
            {newCol.map((colName, index) => (
              <View key={index} style={{flexDirection:'row',marginLeft:15,marginRight:15,paddingHorizontal:7,marginVertical:3}}>
                <View style={[{width:150},colName?.format?.StyleContainer]}>
                  <Text style={[Listing.text,{fontSize:14,fontWeight:'bold'},colName?.format?.StyleLabel]}>{colName?.name??ProperCase(colName.internalid.replace('val_',''))}</Text>
                </View>
                <View style={[{flex:1},colName?.value?.format?.StyleContainer]}>
                  <Text numberOfLines={-1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14},colName?.value?.format?.StyleLabel]}>{colName?.value?.handle?(colName.value.handle(item[colName.internalid] ?? '')):(item[colName.internalid] ?? '')}</Text></View>
              </View>
            ))}
        </TouchableOpacity>
    );
  };

  const CloseSearch = () => {
    HandleClose?.();
    setSearch('');
    setOpenSearch(false);
  }
 
  return (
    <>
        {/*Search*/}
            {openSearch ? (
              <View style={{marginLeft:50,marginRight:50,width:'100%',flexDirection:'row'}}>
                <SearchField placeholder={"Find Projects"} def={search} onChange={setSearch} onFocus={true} />
                  <TouchableOpacity onPress={CloseSearch} style={{ backgroundColor: '#dc3545',width:75,maxWidth:75,padding: 12,borderRadius: 8,marginVertical:10,alignItems: 'center'}}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              ):(
                <View style={{marginLeft:50,marginRight:50,width:'100%',flexDirection:'row'}}>
                <TouchableOpacity onPress={() => {setOpenSearch(true)}} style={{alignSelf:'stretch',width:'100%'}}>
                  <SearchField placeholder={"Find Projects"}/>
                </TouchableOpacity>
                </View>
            )}

          <View style={[{flex:1,flexDirection:'column',alignItems:'center',justifyContent:'center',marginTop:10,marginVertical:5,width:'100%'}]}>
            {openSearch ? 
               (loading ? (
                 <ActivityIndicator size="large" style={{ margin: 10,justifyContent:'center'}} />
                ):(
                list.length === 0?(
                  <NoRecords AddStyle={NoRecordsStyle} />
                ):(
                  <FlatList
                        style={[Form.container]}
                        data={displayList}
                        keyExtractor={(item) => item.internalid}
                        renderItem={({ item }) => {
                          return (
                            <InfoRow item={item} columns={COLUMN_CONFIG} />
                          )
                        }}
                        onEndReached={() => {
                          if (displayList.length < list.length) {
                            LoadMore();
                          }
                        }}
                        onEndReachedThreshold={0.5}
                      />
                )
            )):(children)}
                    
          
          </View>
    </>
     
  );
}

const NoRecords = ({AddStyle}:{AddStyle?:KeyStyles}) => {
  const {Page,Header} = useThemedStyles()
  return (
    <View style={[Page.container,{flex:1,height:'auto'},AddStyle?.StyleContainer]}>
        <Text style={[Header.textReverse,AddStyle?.StyleLabel]}>No records found.</Text>
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

const AttachmentField =({ defaultValue = null,onChange,disabled=false,multiple=false,style}: { defaultValue?: {uri: string,name: string,type: string} | { uri: string; name: string; type: string }[] | null,onChange?:(item: any) => void,disabled?:boolean,multiple?:boolean,style?:TextStyle & ViewStyle})  => {
  const {Theme,CategoryButton} = useThemedStyles()
  const [prompt,setPrompt] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{uri: string;name: string;type: string;}[]>([]);
  const pickFrom = async(place:string): Promise<{uri: string;name: string;type: string;} | undefined | null> => {
    try {
      setPrompt(false);
      let newObj = null
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

  const AddFile = (newfile:{uri: string;name: string;type: string;}, notifyParent = true) => {
    setUploadedFile((prev) => {
      const next = multiple ? [...prev, newfile] : [newfile];
      onChange?.(next); 
      return next;
      
    })
  }

  const RemoveFile = (item: { uri: string; name: string; type: string }, index: number) => {
    setUploadedFile((prev) => {
      const next = prev.filter((_, i) => i !== index)
      onChange?.(next);
      return next;
    })
  }
  
  const AddPick = async(place:string, notify = true) => {
    const NewFile = await pickFrom(place);
    if (NewFile) {
      AddFile(NewFile, notify);
    }
  }
  

  const AttachShow = ({UploadFile,index,style}:{UploadFile:{uri: string;name: string;type: string;},index:number,style?:TextStyle & ViewStyle}) => {
    const openExternal = () => {
      if (UploadFile?.uri) Linking.openURL(UploadFile.uri);
    };
    return (
        <View style={{flexDirection:'row',width:'100%'}}>
          <TouchableOpacity disabled={disabled} style={[{flex:1,marginLeft:10},style]} onPress={openExternal}>
            {UploadFile.type?.startsWith('image/')?
              (<Image source={{ uri: UploadFile.uri }} style={{ width: 100, height: 100, marginTop: 8, borderRadius: 4 }}/>):
              (<View style={{flexDirection:'row'}}><Ionicons name='attach-outline' style={[CategoryButton.icon,{color:Theme.text,flex:0}]}/><Text style={[style,{marginTop:2,flex:1}]}>{UploadFile.name ?? 'Unnamed file'}</Text></View>)
            }  
          </TouchableOpacity>
          <TouchableOpacity style={{marginRight:10}} onPress={() => RemoveFile(UploadFile,index)}>
            <Ionicons name='close' style={[CategoryButton.icon,{color:'red'}]}/>
          </TouchableOpacity>
        </View>
    )
  }


  useEffect(() => {
    if (!defaultValue) return;

    const normalized = Array.isArray(defaultValue) ? defaultValue : [defaultValue];

    // prevent duplicate re-renders
    const isSame = uploadedFile.length === normalized.length &&
      uploadedFile.every((f, i) =>
        f.uri === normalized[i].uri &&
        f.name === normalized[i].name &&
        f.type === normalized[i].type
      );

    if (!isSame) {
      setUploadedFile(normalized);
    }
  }, []);

  useEffect(() => {
    const autoPickOnWeb = async () => {
      if (Platform.OS === 'web' && prompt) {
        await AddPick('document', false); 
        setPrompt(false);
      }
    }
    autoPickOnWeb();
  },[prompt])
  
  return (
    <View style={{flexDirection:'column',flex:1}}>
      {/* Upload File Listing */}
      {uploadedFile.length > 0 && (
        <View style={{flexDirection:'row',flex:1}}>
          
          <FlatList
            style={{borderWidth:1,flex:1,borderTopLeftRadius:5,borderTopRightRadius:5,borderBottomLeftRadius:5,borderBottomRightRadius:5}}       
            data={uploadedFile}
            keyExtractor={(item) => item.uri}
            stickyHeaderIndices={[0]}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item,index}) => {   
                return (
                  <AttachShow UploadFile={item} index={index} style={style} />
                )
            }}
          />
          
        </View>
      )}
      <TouchableOpacity style={[{flex:1,flexDirection:'row',paddingTop:(uploadedFile.length > 0?0:15),paddingBottom:15},style]} onPress={() => setPrompt(true)} >
        <Ionicons name='attach-outline' style={[CategoryButton.icon,style,{color:Theme.text}]}/><Text style={[style,{flex:1,marginTop:2}]}>{uploadedFile ? 'Update Document or Image' : 'Upload Document or Image'}</Text>
      </TouchableOpacity>
      
      {/*Open Modal to choose file selection */}
      <Modal isVisible={prompt && Platform.OS != 'web'} animationIn="fadeIn" animationOut="fadeOut" onBackdropPress={() => setPrompt(false)} onBackButtonPress={() => setPrompt(false)}>
        <TouchableOpacity style={{flex: 1,justifyContent: 'flex-end',backgroundColor:'#a7adb280'}} activeOpacity={1} onPressOut={() => setPrompt(false)}>
          <View style={{padding: 20}}>
            <Text style={{backgroundColor:'transparent',color:'white',fontSize: 18,fontWeight: 'bold',marginBottom: 12,textAlign: 'center'}}>Choose Upload Source</Text>
            <View style={{borderRadius:20,backgroundColor: 'white'}}>
              <TouchableOpacity style={{paddingVertical: 12,borderBottomWidth: 1,borderBottomColor: '#ccc',alignItems:'center'}} onPress={async () => {await AddPick('camera');}}><Text style={{backgroundColor:'transparent',fontSize: 18,fontWeight: 'bold'}}>📷 Take Photo</Text></TouchableOpacity>
              <TouchableOpacity style={{paddingVertical: 12,borderBottomWidth: 1,borderBottomColor: '#ccc',alignItems:'center'}} onPress={async () => {await AddPick('gallery');}}><Text style={{backgroundColor:'transparent',fontSize: 18,fontWeight: 'bold'}}>🖼 Gallery</Text></TouchableOpacity>
              <TouchableOpacity style={{paddingVertical: 12,borderBottomWidth: 1,borderBottomColor: '#ccc',alignItems:'center'}} onPress={async () => {await AddPick('document');}}><Text style={{backgroundColor:'transparent',fontSize: 18,fontWeight: 'bold'}}>📄 Pick File</Text></TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
      
    </ View>
  );

}

const SearchField = ({placeholder,def,onChange=()=>{},AddStyle,onFocus=false}:{placeholder?:string,def?:string,onChange?:(item: string) => void,AddStyle?:KeyStyles,onFocus?:boolean}) => {
  const {Page,Theme} = useThemedStyles()
  const [temp,setTemp] = useState(def);
  const inputRef = useRef<TextInput>(null);
  const DebouncedOnChange = useMemo(() => debounce(onChange, 500), [onChange]);
  const HandleChange = (text:string) => {
      setTemp(text);
      DebouncedOnChange(text)
  };
  useEffect(() => {
      if (onFocus) {
        const Focus = setTimeout(() => {  
          inputRef.current?.focus();
        }, 300);
        return () => clearTimeout(Focus);
      }
    }, [onFocus]);

  return (
    <View style={[{height:'auto',flex:1,borderWidth: 1, padding: 8, margin: 10,borderRadius: 20,flexDirection:'row',justifyContent:'space-between',backgroundColor:'transparent',borderColor:Theme.text},AddStyle?.StyleContainer]}>
      <View style={{width:30}}><Ionicons name="search" style={[AddStyle?.StyleLabel]} color={Theme.text} size={20} /></View>
      <TextInput ref={inputRef} defaultValue={temp} onChangeText={HandleChange} placeholder={placeholder?placeholder:"Search..."} style={[{flex:1,color:Theme.text},AddStyle?.StyleInput]}/>
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
  SearchField,
  ProjectSearchPage
};