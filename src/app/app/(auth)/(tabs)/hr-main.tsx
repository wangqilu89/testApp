import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; 
import {useThemedStyles} from '@/styles';

const approvals = [
  { id: 'personal', title: 'Personal Information',icon:'person-outline'},
  { id: 'leave', title: 'Apply Leave',icon:'calendar-outline'},
  { id: 'expenses', title: 'Submit Claim',icon:'card-outline'},
  { id: 'payslip', title: 'Download Pay Slip',icon:'document-text-outline'}
];

export default function HRScreen() {
  const router = useRouter();
  const {CommonItems,Header,CategoryButton} = useThemedStyles()

  const handlePress = (id: string) => {
    router.push(`/hr/${id}` as any); // 👈 Route to dynamic approval page
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