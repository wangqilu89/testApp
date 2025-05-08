import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; 

const approvals = [
  { id: 'personal', title: 'Personal Information',icon:'person-outline'},
  { id: 'leave', title: 'Apply Leave',icon:'calendar-outline'},
  { id: 'expenses', title: 'Submit Claim',icon:'card-outline'},
  { id: 'payslip', title: 'Download Pay Slip',icon:'document-text-outline'}
];

export default function HRScreen() {
  const router = useRouter();

  const handlePress = (id: string) => {
    router.push(`/hr/${id}` as any); // 👈 Route to dynamic approval page
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
       <View style={{alignItems: 'center',padding:5,backgroundColor: 'grey'}}><Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold'}}>HR</Text></View>
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