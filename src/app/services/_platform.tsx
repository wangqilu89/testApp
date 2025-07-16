import { View, Text, ActivityIndicator,Platform,FlatList, TouchableOpacity} from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect,useMemo} from 'react';
import { Ionicons } from '@expo/vector-icons'; 
import { WebView } from 'react-native-webview';
import {ThemedStyles} from '@/styles';
import { GenericObject, KeyStyles, MenuOption,PageInfoColConfig,PageInfoRowProps } from '@/types';
import { useListFilter } from '@/hooks/useListFilter';
import { ProperCase } from '@/services';
import { SearchField } from '@/components/SearchField';


const MainPage = ({redirect,title,pages,scheme}:{redirect:string;title:string,pages:MenuOption[],scheme:'light'|'dark'|undefined}) => {
  const router = useRouter();
  const {Page,Header,ReactTag,CategoryButton} = ThemedStyles(scheme??'light')
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

const ProjectSearchPage = ({SearchObj,children,HandleClose=null,scheme}:{SearchObj:GenericObject,children?: React.ReactNode,HandleClose?:(()=> void)|null,scheme:'light'|'dark'|undefined}) => {
  const router = useRouter();
  const [openSearch,setOpenSearch] = useState(false);
  const NoRecordsStyle:GenericObject = {StyleContainer:{width:'100%',paddingBottom: 0,backgroundColor:'transparent'},StyleLabel:{textAlign: 'center',color:'black',fontSize: 14, fontWeight: 'bold'}}
  const {Listing,Form} = ThemedStyles(scheme??'light')
  const COLUMN_CONFIG: PageInfoColConfig= [{internalid:'id',name:'Project Code'},{internalid:'name',name:'Project Name'},{internalid:'customer'}];
  const {list,displayList,search,setSearch,loading,UpdateLoad,LoadMore} = useListFilter({LoadModal:false,SearchObj:SearchObj,Enabled:true})
  
  
  const HandleSelect = (id: string) => {
    setOpenSearch(false);
    setSearch('');
    router.push(`/project?id=${id}` as any); 
  };

  const CloseSearch = () => {
    HandleClose?.();
    setSearch('');
    setOpenSearch(false);
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

  
 
  return (
    <>
        {/*Search*/}
            {openSearch ? (
              <View style={{marginLeft:50,marginRight:50,width:'100%',flexDirection:'row'}}>
                <SearchField placeholder={"Find Projects"} def={search} onChange={setSearch} onFocus={true} scheme={scheme}/>
                  <TouchableOpacity onPress={CloseSearch} style={{ backgroundColor: '#dc3545',width:75,maxWidth:75,padding: 12,borderRadius: 8,marginVertical:10,alignItems: 'center'}}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              ):(
                <View style={{marginLeft:50,marginRight:50,width:'100%',flexDirection:'row'}}>
                <TouchableOpacity onPress={() => {setOpenSearch(true)}} style={{alignSelf:'stretch',width:'100%'}}>
                  <SearchField placeholder={"Find Projects"} scheme={scheme}/>
                </TouchableOpacity>
                </View>
            )}

          <View style={[{flex:1,flexDirection:'column',alignItems:'center',justifyContent:'center',marginTop:10,marginVertical:5,width:'100%'}]}>
            {openSearch ? 
               (loading ? (
                 <ActivityIndicator size="large" style={{ margin: 10,justifyContent:'center'}} />
                ):(
                list.length === 0?(
                  <NoRecords AddStyle={NoRecordsStyle} scheme={scheme}/>
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

const NoRecords = ({AddStyle,scheme}:{AddStyle?:KeyStyles,scheme:'light'|'dark'|undefined}) => {
  const {Page,Header} = ThemedStyles(scheme??'light')
  return (
    <View style={[Page.container,{flex:1,height:'auto'},AddStyle?.StyleContainer]}>
        <Text style={[Header.textReverse,AddStyle?.StyleLabel]}>No records found.</Text>
    </View>
    
  )
}

const MainViewer = ({url,doc,scheme}:{url:string,doc:string,scheme:'light'|'dark'|undefined}) => {
  const {Page,Header} = ThemedStyles(scheme??'light')
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






export {
  MainPage,
  NoRecords,
  MainViewer,
  ProjectSearchPage
};