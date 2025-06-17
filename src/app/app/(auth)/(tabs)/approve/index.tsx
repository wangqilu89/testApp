
import { View, Text, TouchableOpacity, FlatList, Alert,Linking} from 'react-native';
import { useEffect, useState, useMemo} from 'react';
import { useRouter, useLocalSearchParams,usePathname} from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; 
import { FetchData,useWebCheck,RESTLET,SERVER_URL,REACT_ENV,USER_ID,MainPage,NoRecords,SearchField} from '@/services'; // 👈 update path
import {useThemedStyles} from '@/styles';
import { useUser } from '@/components/User';
import { useListPost } from '@/hooks/useListPost'

type GenericObject = Record<string, any>;
type AnimatedRowProps = {isCollapsed:boolean,item: any,selected: boolean,colNames: string[]}

const approvals = [
  { id: 'timesheet', title: 'Timesheets',icon:'time-outline'},
  { id: 'expense', title: 'Expense Claims',icon:'card-outline'},
  { id: 'leave', title: 'Leaves',icon:'calendar-outline'},
  { id: 'invoice', title: 'Invoices',icon:'file-tray-full-outline'},
  { id: 'lost', title: 'Lost Clients',icon:'reader-outline'},
];


const ProperCase = (str:string) => {
  return str.toLowerCase().split(/_/g).map(function(word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}

function MainScreen() {
  return (
    <MainPage redirect="approve" pages={approvals} title="Approve"/>
  );
}

function ApprovalCategoryScreen({ category,user}: { category: string,user:GenericObject|null}) {
  const pathname = usePathname();
  const router = useRouter();
  const isWeb = useWebCheck(); // Only "true web" if wide
  const {Form,Listing,Page,Header,Theme,CategoryButton} = useThemedStyles()
  const BaseObj = {user:((REACT_ENV != 'actual')?USER_ID:(user?.id??'0')),restlet:RESTLET,middleware:SERVER_URL + '/netsuite/send?acc=1'};

  const { list, displayList,loading, search,setSearch,loadMore,expandedKeys,HandleExpand,HandleSelect,selectedKeys,HandleSelectAll,selectAll,HandleAction} = useListPost(((category ?? 'index') === 'index') ? 
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

  const COLUMN_CONFIG: Record<string, string[]> = {
    timesheet: ["employee", "weekdate", "project","task","memo","val_timecosts","val_hours"],
    expense:['employee','project','category','expense_date','memo','val_amount'],
    leave:['employee','leave_type','leave_period','date_requested','leave_no','memo','val_days'],
    invoice:['customer','date','document_number','email_addresses','project','currency','val_service','val_ope','val_total','val_sgd_total'],
    lost:['customer','lost_reason','amount']
  };

  const AnimatedRow = ({isCollapsed,item,selected,colNames}:AnimatedRowProps) => {
    const newCol = useMemo(() => {
      return isCollapsed ? colNames.slice() : (colNames.length > 3?[...colNames.slice(0, 3), ...colNames.slice(-1)]:colNames.slice());
    }, [isCollapsed, colNames]);
    
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
                <View style={{width:150}}><Text style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>{ProperCase(colName.replace('val_',''))}</Text></View>
                <View style={{flex:1}}><Text numberOfLines={isCollapsed?-1:1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14}]}>{item[colName] ?? ''}</Text></View>
              </View>
            ))}
        </TouchableOpacity>
        <TouchableOpacity style={{flexDirection:'row',alignItems:'flex-start',flex:-1}} onPress={() => HandleExpand(item.internalid)}>
          <Ionicons name={isCollapsed?"chevron-up":"chevron-down"} style={[CategoryButton.icon,Listing.text,{flex:1,fontSize:23,paddingLeft:3,paddingRight:3}]} />
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
              <View style={{marginLeft:50,marginRight:50}}><SearchField search={search} onChange={setSearch} /></View>
              
              <FlatList
                style={[Form.container]}
                data={displayList}
                keyExtractor={(item) => item.internalid}
                
                renderItem={({ item }) => {
                  return (
                    <AnimatedRow isCollapsed={expandedKeys.includes(item.internalid)} item={item} selected={selectedKeys.includes(item.internalid)} colNames={COLUMN_CONFIG[category]} />
                  )
                }}
                onEndReached={() => {
                  if (displayList.length < list.length) {
                    loadMore();
                  }
                }}
                onEndReachedThreshold={0.5}
              />

              {/*Button */}
              {selectedKeys.length > 0 && (
                <View style={{ width:'100%',flexDirection: 'row', justifyContent: 'space-around', marginTop:10,flex:-1}}>
                  <TouchableOpacity onPress={() => HandleAction('Approve',ApproveObj,true)} style={{ backgroundColor: '#28a745',width:150,maxWidth:150,padding: 12,borderRadius: 8,marginBottom: 20, alignItems: 'center'}}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Approve Selected</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => HandleAction('Reject',RejectObj,true)} style={{ backgroundColor: '#dc3545',width:150,maxWidth:150,padding: 12,borderRadius: 8,marginBottom: 20, alignItems: 'center'}}>
                      <Text style={{ color: 'white', fontWeight: 'bold' }}>Reject Selected</Text>
                  </TouchableOpacity>
                  
                </View>
              )}

            </View>
          ):(
            !loading && <NoRecords/>
          )}
          </>
          
        </View>
    
  );
}

export default function ApproveTransactionsScreen() {
  const { category } = useLocalSearchParams();
  const { user} = useUser(); // ✅ Pull from context
  
  if (!category) {
    return <MainScreen />;
  }
  return <ApprovalCategoryScreen category={category as string} user={user} />;
}
 