import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; 
import { useThemedStyles } from '@/styles';

const approvals = [
  { id: 'timesheets', title: 'Timesheets',icon:'time-outline'},
  { id: 'expenses', title: 'Expense Claims',icon:'card-outline'},
  { id: 'leave', title: 'Leaves',icon:'calendar-outline'},
  { id: 'invoices', title: 'Invoices',icon:'file-tray-full-outline'},
  { id: 'lost', title: 'Lost Clients',icon:'reader-outline'},
];

export default function ApproveTransactionsScreen() {
  const router = useRouter();
  const {CommonItems,Header,CategoryButton} = useThemedStyles()
  const handlePress = (id: string) => {
    router.push(`/approve/${id}`); // 👈 Route to dynamic approval page
  };

  return (
    <View style={[CommonItems.container]}>
             <View style={[Header.container]}><Text style={[Header.text]}>Approve</Text></View>
            <FlatList data={approvals} keyExtractor={(item) => item.id} 
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handlePress(item.id)} style={[CategoryButton.container]}>
                <View style={{ width: 50, alignItems: 'center' }}><Ionicons name={item.icon as any} style={[CategoryButton.text,{fontSize:24}]} /></View>
                <View style={{ flex: 1 }}><Text style={[CategoryButton.text]}>{item.title}</Text></View>
                <View style={{ width: 10, alignItems: 'center' }}><Ionicons name='chevron-forward-outline' style={[CategoryButton.text,{fontSize:24}]} /></View>
      
                </TouchableOpacity>
              )}
            />
          </View>
  );
}