import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert, ScrollView} from 'react-native';
import { useEffect, useState, useRef} from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing} from 'react-native-reanimated';
import { postFunc, useWebCheck,RESTLET,SERVER_URL} from '@/services'; // 👈 update path



export default function ApprovalCategoryScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams();
  const [list, setList] = useState<any[]>([]);
  const [displayList, setDisplayList] = useState<any[]>([]); // ✅ Add this
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [massSelect, setmassSelect] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10; // Show 10 items at a time
  const isWeb = useWebCheck(); // Only "true web" if wide
  const backgroundColors = useRef<Record<string, any>>({}).current;

  const COLUMN_CONFIG: Record<string, { web: string[]; mobile: string[] }> = {
    timesheets: {
      web: ["select", "employee_name", "project", "hours", "department", "status", "date", "manager"],
      mobile: ["employee_name", "project", "hours"],
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
      const data = await postFunc(RESTLET,{restlet:RESTLET,command: `Get ${category} List` });
      setList(data || []);
      setDisplayList((data || []).slice(0, pageSize)); // Show only first 20 items initially
    } 
    catch (err) {
      console.error('Failed to fetch timesheets:', err);
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
        if (!backgroundColors[id]) {
            backgroundColors[id] = useSharedValue('transparent');
        }
        backgroundColors[id].value = withTiming(isSelected ? 'transparent' : '#e0f7fa', { duration: 300 , easing: Easing.inOut(Easing.ease)});
      
        return newSelectedIds;

    });
  };

  const selectAll = () => {
    displayList.forEach((item) => {
        if (selectedIds.includes(item.internalId) != massSelect) {
            toggleSelect(item['internalId'])
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
      await postFunc(SERVER_URL + '/restlet/send?acc=1',{ command: `Approve ${category}`, data: selectedIds });
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
              await postFunc(SERVER_URL + '/restlet/send?acc=1',{ command: `Reject ${category}`, data: selectedIds, reason });
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
                {/* Approve and Reject Buttons */}
                <TouchableOpacity
                onPress={handleApprove}
                style={{ backgroundColor: '#28a745', padding: 15, borderRadius: 8 }}
                >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Approve Selected</Text>
            </TouchableOpacity>

            <TouchableOpacity
            onPress={handleReject}
            style={{ backgroundColor: '#dc3545', padding: 15, borderRadius: 8 }}
            >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Reject Selected</Text>
            </TouchableOpacity>
            {/* Mass Select */}
        <TouchableOpacity
            style={{
            backgroundColor: '#004C6C',
            padding: 12,
            borderRadius: 8,
            marginBottom: 20,
            alignItems: 'center',
            }}
            onPress={selectAll}
        >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
            {massSelect? 'Select All' : 'Unselect All'}
            </Text>
        </TouchableOpacity>
        </View>
        
        {/* Timesheet List */}
        <FlatList
            data={displayList}
            keyExtractor={(item) => item.internalId}
            stickyHeaderIndices={isWeb ? [0] : undefined} // ✅ Sticky header only for web
            ListHeaderComponent={
                isWeb ? (
                  <View style={{ flexDirection: 'row', backgroundColor: '#004C6C', paddingVertical: 10 }}>
                    {columnTitles.map((title, index) => (
                      <Text key={index} style={{flex: 1,color: 'white',fontWeight: 'bold',textAlign: 'center'}}>
                        {toProperCase(title)}
                      </Text>
                    ))}
                  </View>
                ) : null
              }
            renderItem={({item}) => {
                const animatedStyle = useAnimatedStyle(() => ({
                    backgroundColor: backgroundColors[item.internalId]?.value ?? 'transparent',
                  }));
                
                  return isWeb?(<Animated.View style={[{ flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#ccc'},animatedStyle]}>
                <TouchableOpacity onPress={() => toggleSelect(item.internalId)} style={{ flex: 1, alignItems: 'center' }}><Text style={{ fontSize: 20 }}>{selectedIds.includes(item.internalId) ? '☑️' : '⬜'}</Text></TouchableOpacity>
                {columnTitles.slice(1).map((colName, index) => {
                    
                    return (<Text key={index} style={{ flex: 1, textAlign: 'center' }}>{item[colName] ?? ''}</Text>);
                })}

              </Animated.View>)
            :
            (<Animated.View style={[{padding: 15,borderRadius: 8,marginBottom: 12},animatedStyle]}>
                <TouchableOpacity onPress={() => toggleSelect(item.internalId)}>
                    <Text style={{ fontSize: 20 }}>{selectedIds.includes(item.internalId) ? '☑️' : '⬜'}</Text>
                    <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.employeeName}</Text>
                    <Text style={{ fontSize: 14 }}>{item.project}</Text>
                    <Text style={{ fontSize: 14 }}>{item.hours} hours</Text>
                </TouchableOpacity>
            </Animated.View>)
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