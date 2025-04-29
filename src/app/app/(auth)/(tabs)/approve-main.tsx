import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const approvals = [
  { id: 'timesheets', title: 'Timesheets' },
  { id: 'expenses', title: 'Expense Claims' },
  { id: 'leave', title: 'Leaves' },
  { id: 'invoices', title: 'Invoices' },
  { id: 'lost', title: 'Lost Clients' },
];

export default function ApproveTransactionsScreen() {
  const router = useRouter();

  const handlePress = (id: string) => {
    router.push(`/approve/${id}`); // 👈 Route to dynamic approval page
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <FlatList
        data={approvals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handlePress(item.id)}
            style={{
              backgroundColor: '#009FE3',
              padding: 20,
              borderRadius: 10,
              marginBottom: 15,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}