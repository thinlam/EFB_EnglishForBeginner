// app/(admin)/version.tsx
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mỗi file route phải có export default 1 component
export default function AdminVersionScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: '700' }}>Thông tin phiên bản</Text>
        <Text>App: English For Beginners</Text>
        <Text>Version: 1.0.0</Text>
        <Text>Build: 100</Text>
        <Text>Commit: abc1234</Text>
        <Text>Ngày build: 15/09/2025</Text>
      </View>
    </SafeAreaView>
  );
}
