import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert, ScrollView} from 'react-native';
import { useEffect, useState, useRef} from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing} from 'react-native-reanimated';
import { postFunc, useUser,useWebCheck,RESTLET,SERVER_URL,REACT_ENV,USER_ID} from '@/services'; // 👈 update path

type GenericObject = Record<string, any>;
type AnimatedRowProps = {isWeb:boolean,item: any,selected: boolean,colNames: string[],toggleSelect: (id: string) => void, backgroundColors: GenericObject}

const AnimatedRow = ({isWeb,item,selected,colNames,toggleSelect,backgroundColors}:AnimatedRowProps) => {
  const animatedStyle = useAnimatedStyle(() => ({backgroundColor: backgroundColors[item.internalid]?.value ?? 'transparent'}));

  return (
    isWeb?(
      <TouchableOpacity onPress={() => toggleSelect(item.internalid)}>
      <Animated.View style={[{flexDirection: 'row',paddingVertical: 10,borderBottomWidth: 1,borderBottomColor: '#ccc'},animatedStyle]}>
        
          <Text style={{ flex: 1, alignItems: 'center' ,fontSize: 20 }}>{selected ? '☑️' : '⬜'}</Text>
        
          {colNames.map((colName, index) => (
            <Text key={index} style={{ flex: 1, textAlign: 'center' }}>{item[colName] ?? ''}</Text>
          ))} 
        
      </Animated.View>
    </TouchableOpacity>
    ):(
      <Animated.View style={[{flexDirection: 'row',paddingVertical: 10,borderBottomWidth: 1,borderBottomColor: '#ccc'},animatedStyle]}>
      <TouchableOpacity onPress={() => toggleSelect(item.internalid)} style={{ flex: 1, alignItems: 'center' }}>
       
        {colNames.map((colName, index) => (
          <Text key={index} style={{ flex: 1, textAlign: 'center' }}>{item[colName] ?? ''}</Text>
        ))} 
      </TouchableOpacity>
      </Animated.View>
    )
  );
};



export default function ApprovalCategoryScreen() {
  const { user} = useUser(); // ✅ Pull from context
  const router = useRouter();
  const { category } = useLocalSearchParams();
  const [list, setList] = useState<GenericObject[]>([]);
  const [displayList, setDisplayList] = useState<GenericObject[]>([]); // ✅ Add this
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [massSelect, setmassSelect] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10; // Show 10 items at a time
  const isWeb = useWebCheck(); // Only "true web" if wide
  const backgroundColors = useRef<GenericObject>({}).current;
  const selectTransparent = useSharedValue('transparent')

  const COLUMN_CONFIG: Record<string, { web: string[]; mobile: string[] }> = {
    timesheets: {
      web: ["select", "employee", "weekdate", "customer", "memo", "total_hours", "total_timecosts", "approved_hours","approved_costs"],
      mobile: ["employee", "weekdate", "customer","total_hours"],
    },
    expenseclaims: {
      web: ["select", "employee_name", "Claim Date", "Amount", "Currency", "Status"],
      mobile: ["employee_name", "Amount", "Claim Date"],
    },
    leaveapplications: {
      web: ["select", "employee_name", "leave_type", "start_date", "end_date", "status"],
      mobile: ["employee_name", "leave_type", "start_date", "end_date"],
    },
    invoices: {
      web: ["select", "customer", "invoice", "amount", "due_date", "status"],
      mobile: ["customer", "amount", "due_date"],
    },
    lostservices: {
      web: ["select", "customer", "lost_reason", "amount", "lost_date", "owner"],
      mobile: ["customer", "lost_reason",  "lost_date"],
    },
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      let data = await postFunc(SERVER_URL + '/netsuite/send?acc=1',{restlet:RESTLET,user:((REACT_ENV != 'actual')?USER_ID:(user?.id??'0')),command: `Get ${category} List`});
      data = data|| []
      data.forEach((elem:GenericObject) => {
        if (!backgroundColors[elem.internalid]) {
          backgroundColors[elem.internalid] = selectTransparent;
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
      
      await postFunc(SERVER_URL + '/netsuite/send?acc=1',{ command: `Approve ${category}`, data: finalArry});
      selectedIds.forEach((elem) => {
        elem.split(',').forEach((id)=> { 
          finalArry.push(id)
        })
      })
      await postFunc(SERVER_URL + '/netsuite/send?acc=1',{ command: `Approve ${category}`, data: finalArry});
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
              await postFunc(SERVER_URL + '/netsuite/send?acc=1',{ command: `Reject ${category}`, data: selectedIds, reason });
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
    fetchData();
    
  }, [category]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 20 }}>Loading List...</Text>
      </View>
    );
  }

  if (list.length == 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No records found.</Text>
      </View>
    );
  }


  return (
    <ScrollView horizontal={isWeb}>
      {/* Web: Horizontal Scroll enabled */}
        <View style={{ flex: 1, padding: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
            
            <TouchableOpacity onPress={handleApprove} style={{ backgroundColor: '#28a745',padding: 12,borderRadius: 8,marginBottom: 20, alignItems: 'center'}}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Approve Selected</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleReject} style={{ backgroundColor: '#dc3545',padding: 12,borderRadius: 8,marginBottom: 20, alignItems: 'center'}}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Reject Selected</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={selectAll} style={{backgroundColor: '#004C6C',padding: 12,borderRadius: 8,marginBottom: 20, alignItems: 'center'}}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>{massSelect? 'Select All' : 'Unselect All'}</Text>
            </TouchableOpacity>
        </View>
        
        {/* Timesheet List */}
        <FlatList
          data={displayList}
          keyExtractor={(item) => item.internalid}
          stickyHeaderIndices={[0]}
          ListHeaderComponent={
            <View style={{ flexDirection: 'row', backgroundColor: '#004C6C', paddingVertical: 10,display:isWeb?'flex':'none'}}>
                {columnTitles.map((title, index) => (
                  <Text key={index} style={{ flex: 1, color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                    {toProperCase(title)}
                  </Text>
                ))}
            </View>
          }
          renderItem={({ item }) => {
            return (
              <AnimatedRow isWeb={isWeb} item={item} selected={selectedIds.includes(item.internalid)} toggleSelect={toggleSelect} colNames={columnTitles.slice(1)} backgroundColors={backgroundColors}/>
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
    </ScrollView>
  );
}