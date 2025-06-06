
import { View, Text, TouchableOpacity, FlatList, Alert,Linking} from 'react-native';
import { useEffect, useState, useMemo} from 'react';
import { useRouter, useLocalSearchParams,usePathname} from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; 
import { FetchData, useUser,useWebCheck,RESTLET,SERVER_URL,REACT_ENV,USER_ID,LoadingScreen,MainPage,NoRecords,SearchField} from '@/services'; // 👈 update path
import {useThemedStyles} from '@/styles';

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
  const [list, setList] = useState<GenericObject[]>([]);
  const [displayList, setDisplayList] = useState<GenericObject[]>([]); // ✅ Add this
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [massSelect, setmassSelect] = useState(true);
  const [expandedKeys,setExpandedKeys] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10; // Show 10 items at a time
  const isWeb = useWebCheck(); // Only "true web" if wide
  const {Form,Listing,ListHeader,Page,Header,Theme,CategoryButton} = useThemedStyles()
  const BaseObj = {user:((REACT_ENV != 'actual')?USER_ID:(user?.id??'0')),restlet:RESTLET,middleware:SERVER_URL + '/netsuite/send?acc=1'};

  const COLUMN_CONFIG: Record<string, string[]> = {
    timesheet: ["employee", "weekdate", "project","task","memo","val_timecosts","val_hours"],
    expense:['employee','project','category','expense_date','memo','val_amount'],
    leave:['employee','leave_type','leave_period','date_requested','leave_no','memo','val_days'],
    invoice:['customer','date','document_number','email_addresses','project','currency','val_service','val_ope','val_total','val_sgd_total'],
    lost:['customer','lost_reason','amount']
    
  };
 

  const loadData = async () => {
    setLoading(true);
    try {
      let data = await FetchData({...BaseObj,command:`Approve : Get ${category} List`});
      data = data|| []
      

      setList(data);
      setDisplayList(data.slice(0, pageSize)); // Show only first 20 items initially
      
  
    } 
    catch (err) {
      console.error(`Failed to fetch ${category} :`, err);
    } 
    finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    const nextItems = list.slice(0, nextPage * pageSize); // Expand by another 20 items
    setDisplayList(nextItems);
    setPage(nextPage);
  };

  const AnimatedRow = ({isCollapsed,item,selected,colNames}:AnimatedRowProps) => {
    /*
    const animatedBg = useSharedValue('transparent'); // ✅ valid hook usage
    
    useEffect(() => {
      animatedBg.value = withTiming(
        selected ? '#e0f7fa' : 'transparent',
        { duration: 300, easing: Easing.inOut(Easing.ease) }
      );
    }, [selected]);
  
    const animatedStyle = useAnimatedStyle(() => ({
      backgroundColor: animatedBg.value
    }));
    */
    const newCol = useMemo(() => {
      return isCollapsed ? colNames.slice() : (colNames.length > 3?[...colNames.slice(0, 3), ...colNames.slice(-1)]:colNames.slice());
    }, [isCollapsed, colNames]);
    
    const WithFile = (item.hasOwnProperty('file')?(item.file?false:true):false)

    
    return (
      <View style={{backgroundColor:Theme.containerBackground,flexDirection:'row',alignItems:'flex-start',width:'100%',marginTop:5,marginBottom:5,padding:8}}>
        <TouchableOpacity style={{flex:-1,alignItems:'flex-start',flexDirection:'column'}} onPress={() => toggleSelect(item.internalid)}>
          <Text style={[Listing.text,{fontSize:15}]}>{selected ? '☑️' : '⬜'}</Text>
          {item.file &&  (
            <Ionicons name="attach" style={[CategoryButton.icon,Listing.text,{flex:1,fontSize:23}]} />
          )}
        </TouchableOpacity>
        <TouchableOpacity disabled={WithFile} style={{flexDirection:'column',flex:1}} onPress={() => {if (item.file) {Linking.openURL(item.file)} else {toggleSelect(item.internalid);}}}>
            {newCol.map((colName, index) => (
              <View key={index} style={{flexDirection:'row',marginLeft:15,marginRight:15,paddingHorizontal:7,paddingVertical:3,borderBottomWidth:index === 0?1:0}}>
                <View style={{width:150}}><Text style={[Listing.text,{fontSize:14,fontWeight:'bold'}]}>{ProperCase(colName.replace('val_',''))}</Text></View>
                <View style={{flex:1}}><Text numberOfLines={isCollapsed?-1:1} ellipsizeMode="tail"  style={[Listing.text,{fontSize:14}]}>{item[colName] ?? ''}</Text></View>
              </View>
            ))}
        </TouchableOpacity>
        <TouchableOpacity style={{flexDirection:'row',alignItems:'flex-start',flex:-1}} onPress={() => toggleCollapse(item.internalid)}>
          <Ionicons name={isCollapsed?"chevron-up":"chevron-down"} style={[CategoryButton.icon,Listing.text,{flex:1,fontSize:23,paddingLeft:3,paddingRight:3}]} />
        </TouchableOpacity>
      
      </View>
    );
  };
  
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
        const isSelected = prev.includes(id);
        const newSelectedIds = isSelected ? prev.filter((i) => i !== id) : [...prev, id];
        return newSelectedIds;

    });
  };

  const toggleCollapse = (key: string) => {
    setExpandedKeys((prev) =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };
 
  const selectAll = () => {
    displayList.forEach((item) => {
        if (selectedIds.includes(item.internalid) != massSelect) {
            toggleSelect(item['internalid'])
        }
    })
    setmassSelect(!massSelect)
    
  };
  
  const handleApprove = async () => {
    if (selectedIds.length === 0) {
      Alert.alert('Please select at least one record.');
      return;
    }

    try {
      const finalArry: string[] = selectedIds.flatMap(elem => elem.split(','));
      await FetchData({...BaseObj,command:`Approve : Approve ${category}`, data: finalArry});
      

      Alert.alert('Approved successfully!');
      router.back(); // Go back after success
    } catch (err) {
      console.error('Approve failed:', err);
      Alert.alert('Approval failed');
    }
  };

  const handleReject = async () => {
    if (selectedIds.length === 0) {
        Alert.alert('Please select at least one record.');
        return;
    }

    Alert.prompt(
      'Reject Reason',
      'Enter reason for rejection:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Submit',
          onPress: async (reason) => {
            if (!reason) {
              Alert.alert('Rejection reason is required.');
              return;
            }
            try {
              await FetchData({...BaseObj,command:`Approve : Reject ${category}`, data: selectedIds, reason });
              Alert.alert('Rejected successfully!');
              router.back(); // Go back after success
            } catch (err) {
              console.error('Reject failed:', err);
              Alert.alert('Rejection failed');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  
  
  useEffect(() => {
    if (category && category != 'index') {
      loadData();
    }
  }, [category]);

  useEffect(() => {
    const keyword = search.trim().toLowerCase();
    if (keyword === '') {
      const paginated = list.slice(0, page * pageSize);
      setDisplayList(paginated);
    } 
    else {
      const filtered = list.filter((item: GenericObject) =>
        Object.values(item).some((val) =>
          String(typeof val === 'object' ? val?.name ?? '' : val)
            .toLowerCase()
            .includes(keyword)
        )
      );
      setDisplayList(filtered);  
    }
            
  }, [search,page,list]);
  
  if (loading) {
    return (
      <LoadingScreen txt="Loading List..."/>
      
    );
  }

  if (!category || category == 'index') {
    return (
      <MainScreen />
    );
  }

  return (

        <View style={[Page.container,{flexDirection:'column',justifyContent:'flex-start'}]}>
          {/*HEADER */}
          {!isWeb && (
            <View style={[Header.container,{flexDirection:'row'}]}>
              <TouchableOpacity style={{alignItems:'center',justifyContent:'center',flex:-1,marginLeft:5}} onPress={() => router.replace({pathname:pathname as any})}>
                  <Ionicons name="chevron-back" style={[CategoryButton.icon,Header.text,{flex:1,fontSize:30}]} />
              </TouchableOpacity>
              
              <Text style={[Header.text,{flex:1,width:'auto'}]}>{category.toUpperCase()}</Text>
              
            
              <TouchableOpacity onPress={selectAll} style={{alignItems:'center',justifyContent:'center',flex:-1,marginRight:10}}>
                <Ionicons name={massSelect?"square-outline":"checkbox-outline"} style={[CategoryButton.icon,Header.text,{flex:1,fontSize:30}]} />
                
              </TouchableOpacity>
            </View>
          )}
          {list.length > 0 ? (
          
            <View style={{flexDirection:'column',width:'100%',maxWidth:600,flex: 1}}>
              {/* Timesheet List */}
              {/*Search*/}
              <View style={{marginLeft:50,marginRight:50}}><SearchField search={search} onChange={setSearch} /></View>
              
              <FlatList
                style={[Form.container]}
                data={displayList}
                keyExtractor={(item) => item.internalid}
                
                renderItem={({ item }) => {
                  return (
                    <AnimatedRow isCollapsed={expandedKeys.includes(item.internalid)} item={item} selected={selectedIds.includes(item.internalid)} colNames={COLUMN_CONFIG[category]} />
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
              {selectedIds.length > 0 && (
                <View style={{ width:'100%',flexDirection: 'row', justifyContent: 'space-around', marginTop:10,flex:-1}}>
                  <TouchableOpacity onPress={handleApprove} style={{ backgroundColor: '#28a745',width:150,maxWidth:150,padding: 12,borderRadius: 8,marginBottom: 20, alignItems: 'center'}}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Approve Selected</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleReject} style={{ backgroundColor: '#dc3545',width:150,maxWidth:150,padding: 12,borderRadius: 8,marginBottom: 20, alignItems: 'center'}}>
                      <Text style={{ color: 'white', fontWeight: 'bold' }}>Reject Selected</Text>
                  </TouchableOpacity>
                  
                </View>
              )}

            </View>
          ):(
            <NoRecords/>

          )}

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
 