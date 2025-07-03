
import { View, Text, TouchableOpacity, FlatList, Alert,Linking} from 'react-native';
import { useMemo} from 'react';
import { useRouter, useLocalSearchParams,usePathname} from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; 
import { useWebCheck,RESTLET,SERVER_URL,REACT_ENV,USER_ID,MainPage,NoRecords,SearchField,ProperCase,NumberComma} from '@/services'; // 👈 update path
import {useThemedStyles} from '@/styles';
import { useUser } from '@/components/User';
import { useListPost } from '@/hooks/useListPost'
import { GenericObject,PageProps,User,PageInfoColConfig,PageInfoRowProps,MenuOption} from '@/types';

const approvals:MenuOption[] = [
  { internalid: 'timesheet', name: 'Timesheets',icon:'time-outline'},
  { internalid: 'expense', name: 'Expense Claims',icon:'card-outline'},
  { internalid: 'leave', name: 'Leaves',icon:'calendar-outline'},
  { internalid: 'invoice', name: 'Invoices',icon:'file-tray-full-outline'},
  { internalid: 'lost', name: 'Lost Clients',icon:'reader-outline'},
];

function MainScreen() {
  return (
    <MainPage redirect="approve" pages={approvals} title="Approve"/>
  );
};

function ApprovalCategoryScreen({ category,user,BaseObj}:PageProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isWeb = useWebCheck(); // Only "true web" if wide
  const {Form,Listing,Page,Header,Theme,CategoryButton} = useThemedStyles()
  

  const { list, displayList,loading, search,setSearch,LoadMore,expandedKeys,HandleExpand,HandleSelect,selectedKeys,HandleSelectAll,selectAll,HandleAction,LoadAll} = useListPost(((category ?? 'index') === 'index') ? 
    {}:
    { LoadObj:{...BaseObj,command:`Approve : Get ${category} List`},
      PostObj:{...BaseObj},
      SearchFunction: (i, keyword) => {
      return i.filter((item: GenericObject) =>
          Object.values(item).some((val) =>
            String(typeof val === 'object' ? (val?.name ?? '') : val)
              .toLowerCase()
              .includes(keyword)
          )
      )}
    }
  );

  const COLUMN_CONFIG: PageInfoColConfig = {
    timesheet: [{internalid:"employee"},{internalid:"weekdate"} ,{internalid:"project"},{internalid:"task"},{internalid:"memo"},{internalid:"val_timecosts",value:{handle:NumberComma}},{internalid:"val_hours",value:{handle:NumberComma}}],
    expense:[{internalid:"employee"},{internalid:"project"},{internalid:"category"},{internalid:"expense_date"},{internalid:"memo"},{internalid:'val_amount',value:{handle:NumberComma}}],
    leave:[{internalid:"employee"},{internalid:"leave_type"},{internalid:"leave_period"},{internalid:"date_requested"},{internalid:"leave_no"},{internalid:"memo"},{internalid:"val_days",value:{handle:NumberComma}}],
    invoice:[{internalid:"customer"},{internalid:"date"},{internalid:"document_number"},{internalid:"email_addresses"},{internalid:'project'},{internalid:'currency'},{internalid:'val_service',value:{handle:NumberComma}},{internalid:'val_ope',name:'OPE',value:{handle:NumberComma}},{internalid:'val_total',value:{handle:NumberComma}},{internalid:'val_sgd_total',name: 'SGD Total',value:{handle:NumberComma}}],
    lost:[{internalid:"customer"},{internalid:'lost_reason'},{internalid:'amount',value:{handle:NumberComma}}]
  };

  const InfoRow = ({expanded,item,selected,columns}:PageInfoRowProps) => {
    const newCol = useMemo(() => {
      return Array.isArray(columns)?
         ((columns.length > 3 && !expanded)?
          [...columns.slice(0, 3), ...columns.slice(-1)]:
          columns.slice())
         :[];
    }, [expanded, columns]);
    
    const WithFile = (item.hasOwnProperty('file')?(item.file?false:true):false)

    return (
      <View style={{backgroundColor:Theme.containerBackground,flexDirection:'row',alignItems:'flex-start',width:'100%',marginTop:5,marginBottom:5,padding:8}}>
        <TouchableOpacity style={{flex:-1,alignItems:'flex-start',flexDirection:'column'}} onPress={() => HandleSelect(item.internalid)}>
          <Text style={[Listing.text,{fontSize:15}]}>{selected ? '☑️' : '⬜'}</Text>
          {item.file &&  (
            <Ionicons name="attach" style={[CategoryButton.icon,Listing.text,{flex:1,fontSize:23}]} />
          )}
        </TouchableOpacity>
        <TouchableOpacity disabled={WithFile} style={{flexDirection:'column',flex:1}} onPress={() => {if (item.file) {Linking.openURL(item.file)} else {HandleSelect(item.internalid);}}}>
            {newCol.map((colName, index) => (
              <View key={index} style={{flexDirection:'row',marginLeft:15,marginRight:15,paddingHorizontal:7,paddingVertical:3,borderBottomWidth:index === 0?1:0}}>
                <View style={[{width:150},colName?.format?.StyleContainer]}><Text style={[Listing.text,{fontSize:14,fontWeight:'bold'},colName?.format?.StyleLabel]}>{colName?.name??ProperCase(colName.internalid.replace('val_',''))}</Text></View>
                <View style={[{flex:1},colName?.value?.format?.StyleContainer]}><Text numberOfLines={expanded?-1:1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14},colName?.value?.format?.StyleLabel]}>{colName?.value?.handle?(colName.value.handle(item[colName.internalid] ?? '')):(item[colName.internalid] ?? '')}</Text></View>
              </View>
            ))}
        </TouchableOpacity>
        <TouchableOpacity style={{flexDirection:'row',alignItems:'flex-start',flex:-1}} onPress={() => HandleExpand(item.internalid)}>
          <Ionicons name={expanded?"chevron-up":"chevron-down"} style={[CategoryButton.icon,Listing.text,{flex:1,fontSize:23,paddingLeft:3,paddingRight:3}]} />
        </TouchableOpacity>
      
      </View>
    );
  };
  
  const ApproveObj = {
    msg:'Do you want to approve ' + selectedKeys.length + ' items?',
    icon:{label:<Ionicons name="help-outline"style={{fontSize:50,color:'orange'}}/>,visible:true},
    input:{visible:false}
  }
  const RejectObj = {
    msg:'Do you want to reject ' + selectedKeys.length + ' items?',
    icon:{label:<Ionicons name="help-outline"style={{fontSize:50,color:'orange'}}/>,visible:true},
    input:{visible:true,label:'Please type in reason'}
  }

  if (!category || category == 'index') {
    return (
      <MainScreen />
    );
  }

  return (
        <View style={[Page.container,{flexDirection:'column',justifyContent:'flex-start'}]}>
          <>
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
              {/*Search*/}
              <View style={{marginLeft:50,marginRight:50}}><SearchField def={search} onChange={setSearch} /></View>
              
              <FlatList
                style={[Form.container]}
                data={displayList}
                keyExtractor={(item) => item.internalid}
                renderItem={({ item }) => {
                  return (
                    <InfoRow expanded={expandedKeys.includes(item.internalid)} item={item} selected={selectedKeys.includes(item.internalid)} columns={COLUMN_CONFIG[category]} />
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
                <View style={{ width:'100%',flexDirection: 'row', justifyContent: 'space-around', marginTop:10,flex:-1}}>
                  <TouchableOpacity onPress={() => HandleAction('Approve',ApproveObj,true)} style={{ backgroundColor: '#28a745',width:150,maxWidth:150,padding: 12,borderRadius: 8,marginBottom: 20, alignItems: 'center'}}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Approve Selected</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => HandleAction('Reject',RejectObj,true)} style={{ backgroundColor: '#dc3545',width:150,maxWidth:150,padding: 12,borderRadius: 8,marginBottom: 20, alignItems: 'center'}}>
                      <Text style={{ color: 'white', fontWeight: 'bold' }}>Reject Selected</Text>
                  </TouchableOpacity>
                  
                </View>
              ):(displayList.length < list.length && (
                <TouchableOpacity onPress={() => {LoadAll()}} style={[Form.container,{flex:-1,alignItems:'center',marginVertical:5}]}>
                  <Text style={{fontWeight:'bold'}}>Show All</Text>
                </TouchableOpacity>
              ))}

            </View>
          ):(
            !loading && <NoRecords/>
          )}
          </>
          
        </View>
    
  );
};

export default function ApproveTransactionsScreen() {
  const { category } = useLocalSearchParams();
  const { user,BaseObj} = useUser(); // ✅ Pull from context
  
  if (!category) {
    return <MainScreen />;
  }
  return <ApprovalCategoryScreen category={category as string} user={user as User} BaseObj={BaseObj as GenericObject} />;
}
 