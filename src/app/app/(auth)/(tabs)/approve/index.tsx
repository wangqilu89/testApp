
import { View, Text, TouchableOpacity, FlatList, Alert} from 'react-native';
import { useEffect, useState, useRef} from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing} from 'react-native-reanimated';
import { FetchData, useUser,useWebCheck,RESTLET,SERVER_URL,REACT_ENV,USER_ID,LoadingScreen,MainPage,NoRecords} from '@/services'; // 👈 update path
import {useThemedStyles} from '@/styles';

type GenericObject = Record<string, any>;
type AnimatedRowProps = {isWeb:boolean,item: any,selected: boolean,colNames: string[],toggleSelect: (id: string) => void, backgroundColors: GenericObject}

const approvals = [
  { id: 'timesheet', title: 'Timesheets',icon:'time-outline'},
  { id: 'expense', title: 'Expense Claims',icon:'card-outline'},
  { id: 'leave', title: 'Leaves',icon:'calendar-outline'},
  { id: 'invoice', title: 'Invoices',icon:'file-tray-full-outline'},
  { id: 'lost', title: 'Lost Clients',icon:'reader-outline'},
];


function MainScreen() {
  return (
    <MainPage redirect="approve" pages={approvals} title="Approve"/>
  );
}


function ApprovalCategoryScreen({ category,user}: { category: string,user:GenericObject|null}) {
  
  const router = useRouter();
  const [list, setList] = useState<GenericObject[]>([]);
  const [displayList, setDisplayList] = useState<GenericObject[]>([]); // ✅ Add this
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [massSelect, setmassSelect] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10; // Show 10 items at a time
  const isWeb = useWebCheck(); // Only "true web" if wide
  const backgroundColors = useRef<GenericObject>({}).current;
  const {Form,Listing,ListHeader,Page,Header} = useThemedStyles()
  const BaseObj = {user:((REACT_ENV != 'actual')?USER_ID:(user?.id??'0')),restlet:RESTLET,middleware:SERVER_URL + '/netsuite/send?acc=1'};

  const COLUMN_CONFIG: Record<string, { web: string[]; mobile: string[] }> = {
    timesheet: {
      web: ["select", "employee", "weekdate", "customer", "memo", "total_hours", "total_timecosts", "approved_hours","approved_costs"],
      mobile: ["employee", "weekdate", "customer","total_hours"],
    },
    expenseclaim: {
      web: ["select", "employee_name", "Claim Date", "Amount", "Currency", "Status"],
      mobile: ["employee_name", "Amount", "Claim Date"],
    },
    leave: {
      web: ["select", "employee_name", "leave_type", "start_date", "end_date", "status"],
      mobile: ["employee_name", "leave_type", "start_date", "end_date"],
    },
    invoice: {
      web: ["select", "customer", "invoice", "amount", "due_date", "status"],
      mobile: ["customer", "amount", "due_date"],
    },
    lost: {
      web: ["select", "customer", "lost_reason", "amount", "lost_date", "owner"],
      mobile: ["customer", "lost_reason",  "lost_date"],
    },
  };
 

  const loadData = async () => {
    setLoading(true);
    try {
      let data = await FetchData({...BaseObj,command:`Approve : Get ${category} List`});
      data = data|| []
      data.forEach((elem:GenericObject) => {
        if (!backgroundColors[elem.internalid]) {
          backgroundColors[elem.internalid] = useSharedValue('transparent');
        }
      });

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

  const AnimatedRow = ({isWeb,item,selected,colNames,toggleSelect,backgroundColors}:AnimatedRowProps) => {
    const animatedStyle = useAnimatedStyle(() => ({backgroundColor: backgroundColors[item.internalid]?.value ?? 'transparent'}));
  
    return (
      <TouchableOpacity onPress={() => toggleSelect(item.internalid)}>
        <Animated.View style={[Listing.container,animatedStyle]}>
          {isWeb ? (
            <>
            <Text style={[Listing.text]}>{selected ? '☑️' : '⬜'}</Text>
            {colNames.slice(1).map((colName, index) => (
              <Text key={index} style={[Listing.text]}>{item[colName] ?? ''}</Text>
            ))} 
            </>
          ):(
            <>
            {colNames.map((colName, index) => (
              <Text key={index} style={[Listing.text]}>{item[colName] ?? ''}</Text>
            ))}
            </> 
          )
        }
        </Animated.View>
      </TouchableOpacity>
    );
  };
  
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
        const isSelected = prev.includes(id);
        const newSelectedIds = isSelected ? prev.filter((i) => i !== id) : [...prev, id];
        
        backgroundColors[id].value = withTiming(
          isSelected ? 'transparent' : '#e0f7fa',
          { duration: 300, easing: Easing.inOut(Easing.ease) }
        );
      
        return newSelectedIds;

    });
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

  const getColumnTitles = (category: string, isWeb: boolean) => {
    const config = COLUMN_CONFIG[category];
    if (config) {
        return isWeb ? config.web : config.mobile;
    }
    // Default fallback if category not found
    return isWeb
        ? ["Select", "Record Name", "Field 1", "Field 2"]
        : ["Record Name", "Field 1"];
  };
  const columnTitles = getColumnTitles(category as string, isWeb);

  const toProperCase = (str:string) => {
    return str.toLowerCase().split(/_/g).map(function(word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
  }


  useEffect(() => {
    if (category && category != 'index') {
      loadData();
    }
  }, [category]);

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

        <View style={[Page.container]}>
          {/*HEADER */}
          {!isWeb && (
            <View style={[Header.container]}><Text style={[Header.text]}>{category.toUpperCase()}</Text></View>
          )}
          {list.length > 0 ? (
          
            <View style={{flex:1}}>
            {/*Button */}
              <View style={{ width:'100%',flexDirection: 'row', justifyContent: 'space-around', marginTop:10 }}>
                
                <TouchableOpacity onPress={handleApprove} style={{ backgroundColor: '#28a745',width:150,maxWidth:150,padding: 12,borderRadius: 8,marginBottom: 20, alignItems: 'center'}}>
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Approve Selected</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleReject} style={{ backgroundColor: '#dc3545',width:150,maxWidth:150,padding: 12,borderRadius: 8,marginBottom: 20, alignItems: 'center'}}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Reject Selected</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={selectAll} style={{backgroundColor: '#004C6C',width:150,maxWidth:150,padding: 12,borderRadius: 8,marginBottom: 20, alignItems: 'center'}}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>{massSelect? 'Select All' : 'Unselect All'}</Text>
                </TouchableOpacity>
              </View>
            
            {/* Timesheet List */}
              <FlatList
                style={[Form.container]}
                data={displayList}
                keyExtractor={(item) => item.internalid}
                stickyHeaderIndices={[0]}
                ListHeaderComponent={
                  <View style={[ListHeader.container]}>
                      {columnTitles.map((title, index) => (
                        <Text key={index} style={[ListHeader.text]}>
                          {toProperCase(title)}
                        </Text>
                      ))}
                  </View>
                }
                renderItem={({ item }) => {
                  return (
                    <AnimatedRow isWeb={isWeb} item={item} selected={selectedIds.includes(item.internalid)} toggleSelect={toggleSelect} colNames={columnTitles} backgroundColors={backgroundColors}/>
                  )
                }}
                onEndReached={() => {
                  if (displayList.length < list.length) {
                    loadMore();
                  }
                }}
                onEndReachedThreshold={0.5}
              />
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
 