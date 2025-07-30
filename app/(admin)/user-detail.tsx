import { db } from '@/scripts/firebase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function UserDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editableUser, setEditableUser] = useState({
    name: '',
    email: '',
    role: '',
    phone: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'users', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUser(userData);
          setEditableUser({
            name: userData.name || '',
            email: userData.email || '',
            role: userData.role || '',
            phone: userData.phone || '',
          });
        } else {
          console.warn('Không tìm thấy người dùng');
        }
      } catch (error) {
        console.error('Lỗi khi lấy chi tiết người dùng:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleSave = async () => {
    try {
      await setDoc(doc(db, 'users', id), editableUser);
      Alert.alert('✅ Thành công', 'Thông tin người dùng đã được cập nhật');
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin:', error);
      Alert.alert('❌ Lỗi', 'Không thể cập nhật thông tin.');
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  if (!user) return <Text style={{ padding: 20 }}>Không tìm thấy người dùng.</Text>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>📝 Chỉnh sửa người dùng</Text>

        <Text style={styles.label}>Tên</Text>
        <TextInput
          value={editableUser.name}
          onChangeText={(text) => setEditableUser({ ...editableUser, name: text })}
          style={styles.input}
          placeholder="Tên người dùng"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={editableUser.email}
          onChangeText={(text) => setEditableUser({ ...editableUser, email: text })}
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput
          value={editableUser.phone}
          onChangeText={(text) => setEditableUser({ ...editableUser, phone: text })}
          style={styles.input}
          placeholder="Nhập số điện thoại"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Role</Text>
        <TextInput
          value={editableUser.role}
          onChangeText={(text) => setEditableUser({ ...editableUser, role: text })}
          style={styles.input}
          placeholder="user / admin / premium"
        />

        <TouchableOpacity style={[styles.button, { backgroundColor: 'green' }]} onPress={handleSave}>
          <Text style={styles.buttonText}>💾 Lưu thay đổi</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>⬅ Quay lại</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  backButton: {
    padding: 12,
    backgroundColor: '#ccc',
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    fontWeight: 'bold',
  },
});
