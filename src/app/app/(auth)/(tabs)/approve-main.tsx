import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; 

const approvals = [
  { id: 'timesheets', title: 'Timesheets',icon:'time-outline'},
  { id: 'expenses', title: 'Expense Claims',icon:'card-outline'},
  { id: 'leave', title: 'Leaves',icon:'calendar-outline'},
  { id: 'invoices', title: 'Invoices',icon:'file-tray-full-outline'},
  { id: 'lost', title: 'Lost Clients',icon:'reader-outline'},
];

export default function ApproveTransactionsScreen() {
  const router = useRouter();

  const handlePress = (id: string) => {
    router.push(`/approve/${id}`); // 👈 Route to dynamic approval page
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
       <View style={{alignItems: 'center',padding:5,backgroundColor: 'grey'}}><Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold'}}>Approve</Text></View>
      <FlatList data={approvals} keyExtractor={(item) => item.id} 
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePress(item.id)} style={{
              backgroundColor: 'transparent',
              padding: 20,
              borderBottomWidth: 1,
              borderBottomColor: 'black',
              marginTop:2,
              marginBottom:2,
              alignItems: 'center',
              flexDirection: 'row'
            }}>
          <View style={{ width: 50, alignItems: 'center' }}><Ionicons name={item.icon as any} size={24} color="black" /></View>
          <View style={{ flex: 1 }}><Text style={{ color: 'black', fontSize: 18, fontWeight: 'bold', textAlign: 'left' }}>{item.title}</Text></View>
          <View style={{ width: 10, alignItems: 'center' }}><Ionicons name='chevron-forward-outline' size={24} color="black" /></View>

          </TouchableOpacity>
        )}
      />
    </View>
  );
}