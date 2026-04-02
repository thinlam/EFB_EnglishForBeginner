import { styles } from '@/components/style/UserDetailStyles';
import { useUserDetail } from '@/hooks/admin/useUserDetail';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function UserDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    loading, user,
    form, setField,
    handleSave,
  } = useUserDetail(id);

  if (!id) return <Text style={{ padding: 20 }}>Thiếu ID người dùng.</Text>;
  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  if (!user) return <Text style={{ padding: 20 }}>Không tìm thấy người dùng.</Text>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>📝 Chỉnh sửa người dùng</Text>

        <Text style={styles.label}>Tên</Text>
        <TextInput
          value={form.name}
          onChangeText={(t) => setField('name', t)}
          style={styles.input}
          placeholder="Tên người dùng"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={form.email}
          onChangeText={(t) => setField('email', t)}
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput
          value={form.phone}
          onChangeText={(t) => setField('phone', t.replace(/[^\d+]/g, ''))}
          style={styles.input}
          placeholder="Nhập số điện thoại"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Role</Text>
        <TextInput
          value={form.role}
          onChangeText={(t) => setField('role', t)}
          style={styles.input}
          placeholder="user / admin / premium / Maxpremium"
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: 'green' }]}
          onPress={async () => {
            const ok = await handleSave();
            if (ok) Alert.alert('✅ Thành công', 'Thông tin người dùng đã được cập nhật');
          }}
        >
          <Text style={styles.buttonText}>💾 Lưu thay đổi</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>⬅ Quay lại</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
