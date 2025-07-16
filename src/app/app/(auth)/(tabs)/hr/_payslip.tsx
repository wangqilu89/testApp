
import { View, Text, TouchableOpacity, FlatList, Linking} from 'react-native';
import { useRouter, usePathname} from 'expo-router';
import { useWebCheck,ProperCase,NumberComma} from '@/services'; // 👈 functions
import { NoRecords} from '@/services'; // 👈 Common Screens
import { usePrompt } from '@/components/AlertModal';
import { useListFilter } from '@/hooks/useListFilter'
import { Ionicons } from '@expo/vector-icons'; 
import {ThemedStyles} from '@/styles';
import { GenericObject,MenuOption,PageProps, User,PageInfoColConfig,PageInfoRowProps,PageInfoColProps} from '@/types';
import { SearchField } from '@/components/SearchField';


export const PaySlip = ({ category,user,BaseObj,scheme}: { category: string,user:GenericObject|null,BaseObj:GenericObject,scheme:'light'|'dark'|undefined}) => {
  const { ShowPrompt} = usePrompt();
  const pathname = usePathname();
  const router = useRouter();
  const isWeb = useWebCheck(); // Only "true web" if wide
  const {Form,Listing,ListHeader,Page,Header,Theme,CategoryButton} = ThemedStyles(scheme??'light')
  const BaseURL = 'https://6134818.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=1325&deploy=2&compid=6134818&ns-at=AAEJ7tMQJ3SMaw4sy0kmPgB70YakOyRxtZWjGXjhVrFJF6GqVtI&recordType=payslip&recordId='
  
  const COLUMN_CONFIG: PageInfoColConfig=[
    {internalid:'employee'},
    {internalid:'name',name:'Period'},
    {internalid:'val_salary',value:{handle:NumberComma}}
  ]
  
  const {list,displayList,setSearch,search,loading,LoadMore,HandleSelect,selectedKeys,HandleSelectAll,selectAll,LoadAll} = useListFilter({
    LoadObj:{...BaseObj,user:user?.id??0,command:'HR : Get payslip List'},
    SearchFunction: (i, keyword) => {
      return i.flatMap((j) => {
        const CheckA = Object.values(j).some((val) => 
            String(typeof val === 'object' ? '' : val).toLowerCase().includes(keyword)
        )
        const newArry = (CheckA)?(j.line):(j.line?.filter((item: GenericObject) =>
          Object.values(item).some((val) =>
            String(typeof val === 'object' ? val?.name ?? '' : val)
              .toLowerCase()
              .includes(keyword)
          )
        ));
        return newArry.length > 0 ? [{...i,line:newArry}] : [];
      });
    }
  });

  const RowInfo = ({item,selected,columns}:PageInfoRowProps) => {
   
    return (
      <View style={{backgroundColor:'white',flexDirection:'row',alignItems:'flex-start',width:'100%',marginTop:5,marginBottom:5,padding:8}}>
        <TouchableOpacity style={{flex:-1,alignItems:'flex-start',flexDirection:'column'}} onPress={() => HandleSelect(item.internalid)}>
          <Text style={[Listing.text,{fontSize:15}]}>{selected ? '☑️' : '⬜'}</Text>
          {item.file &&  (
            <Ionicons name="attach" style={[CategoryButton.icon,Listing.text,{flex:1,fontSize:23}]} />
          )}
        </TouchableOpacity>
        <TouchableOpacity style={{flexDirection:'column',flex:1}} onPress={() => {Linking.openURL(BaseURL + item.internalid)}}>
            {Array.isArray(columns)?
              columns.map((colName, index) => (
                <View key={index} style={{flexDirection:'row',marginLeft:15,marginRight:15,paddingHorizontal:7,paddingVertical:3,borderBottomWidth:index === 0?1:0}}>
                  <View style={{width:150}}>
                    <Text style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>
                      {colName?.name??ProperCase(colName.internalid.replace('val_',''))}
                    </Text>
                  </View>
                  <View style={{flex:1}}>
                    <Text numberOfLines={1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14}]}>
                      {colName?.value?.handle?(colName.value.handle(item[colName.internalid] ?? '')):(item[colName.internalid] ?? '')}
                    </Text>
                  </View>
                </View>
              )):
              <></>
            }
        </TouchableOpacity>
        <TouchableOpacity style={{flexDirection:'row',justifyContent:'center',alignItems:'center',flex:-1,height:'100%'}} onPress={() => Linking.openURL(BaseURL + item.internalid)}>
          <Ionicons name="chevron-forward" style={[CategoryButton.icon,Listing.text,{flex:1,fontSize:23,paddingLeft:3,paddingRight:3}]} />
        </TouchableOpacity>
      
      </View>
    );
  };
  
  
  const HandleDownload = async () => {
    if (selectedKeys.length === 0) {
        ShowPrompt({msg:'Please select at least one record.'})
        return;
    }
    Linking.openURL(BaseURL + selectedKeys.join('|'))
  };
  
  return (

        <View style={[Page.container,{flexDirection:'column',justifyContent:'flex-start'}]}>
          {/*HEADER */}
          {!isWeb && (
            <View style={[Header.container,{flexDirection:'row'}]}>
              <TouchableOpacity style={{alignItems:'center',justifyContent:'center',flex:-1,marginLeft:5}} onPress={() => router.replace({pathname:pathname as any})}>
                  <Ionicons name="chevron-back" style={[CategoryButton.icon,Header.text,{flex:1,fontSize:30}]} />
              </TouchableOpacity>
              <Text style={[Header.text,{flex:1,width:'auto'}]}>{category.toUpperCase()}</Text>
              <TouchableOpacity onPress={HandleSelectAll} style={{alignItems:'center',justifyContent:'center',flex:-1,marginRight:10}}>
                <Ionicons name={selectAll?"square-outline":"checkbox-outline"} style={[CategoryButton.icon,Header.text,{flex:1,fontSize:30}]} />
                
              </TouchableOpacity>
            </View>
          )}
          {list.length > 0 ? (
          
            <View style={{flexDirection:'column',width:'100%',maxWidth:600,flex: 1}}>
              {/* Payslip List */}
              {/*Search*/}
              <View style={{marginLeft:50,marginRight:50}}><SearchField def={search} onChange={setSearch} scheme={scheme} /></View>
              
              <FlatList
                style={[Form.container]}
                data={displayList}
                keyExtractor={(item) => item.internalid}
                
                renderItem={({ item }) => {
                  return (
                    <RowInfo item={item} selected={selectedKeys.includes(item.internalid)} columns={COLUMN_CONFIG} />
                  )
                }}
                onEndReached={() => {
                  if (displayList.length < list.length) {
                    LoadMore();
                  }
                }}
                onEndReachedThreshold={0.5}
              />

              {/*Button */}
              {selectedKeys.length > 0 ? (
                <View style={{ width:'100%',flexDirection: 'row', justifyContent: 'center', marginTop:10,flex:-1}}>
                  <TouchableOpacity onPress={HandleDownload} style={{ backgroundColor: '#28a745',width:150,maxWidth:150,padding: 12,borderRadius: 8,marginBottom: 20, alignItems: 'center'}}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Download</Text>
                  </TouchableOpacity>
                  
                </View>
              ): (
                displayList.length < list.length && (
                  <TouchableOpacity onPress={() => {LoadAll()}} style={[Form.container,{flex:-1,alignItems:'center',marginVertical:5}]}>
                    <Text style={{fontWeight:'bold'}}>Show All</Text>
                  </TouchableOpacity>
              ))}

            </View>
          ):(!loading && 
            <NoRecords scheme={scheme}/>

          )}

        </View>
    
  );
}