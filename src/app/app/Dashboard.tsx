import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to NetSuite Dashboard</Text>

      <View style={styles.buttonGroup}>
        <Button title="📝 Apply Leave" onPress={() => alert('Leave screen placeholder')} />
        <Button title="✅ Approve Transactions" onPress={() => alert('Approve screen placeholder')} />
        <Button title="📦 Submit Transactions" onPress={() => alert('Submit screen placeholder')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  buttonGroup: { gap: 16 },
});