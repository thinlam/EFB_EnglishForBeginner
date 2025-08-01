import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SystemSettingScreen() {
  const router = useRouter();
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const fetchRole = async () => {
      const role = await AsyncStorage.getItem('userRole');
      setUserRole(role || 'user');
    };
    fetchRole();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/login');
  };

  const SettingItem = ({ icon, label, onPress, danger = false }: any) => (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <Text style={[styles.itemText, danger && { color: '#d00' }]}>
        {icon}  {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView style={styles.container}>
        
        <Text style={styles.title}>⚙️ Cài đặt hệ thống</Text>

       <>
            <SettingItem icon="👥" label="Quản lý vai trò" onPress={() => router.push('/admin/manage-roles')} />
            <SettingItem icon="📚" label="Quản lý bài học" onPress={() => router.push('/admin/manage-content')} />
            <SettingItem icon="🗃️" label="Log hệ thống" onPress={() => router.push('/admin/system-log')} />
          </>

        <SettingItem icon="📱" label="Phiên bản ứng dụng" onPress={() => router.push('/about/version')} />
        <SettingItem icon="📄" label="Chính sách bảo mật" onPress={() => router.push('/about/privacy')} />
        <SettingItem icon="🧑‍💻" label="Góp ý & Liên hệ" onPress={() => router.push('/about/feedback')} />
        <SettingItem icon="⭐" label="Đánh giá ứng dụng" onPress={() => router.push('/about/rating')} />

        <SettingItem icon="🚪" label="Đăng xuất" onPress={handleLogout} danger />
      </ScrollView>
      <TouchableOpacity onPress={() => router.push('/(admin)/home')} style={styles.backButton}>
                  <Text style={styles.backButtonText}>⬅ Quay lại</Text>
                </TouchableOpacity>
    </SafeAreaView>
    
  );
  
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 16,
  },
  item: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: {
    fontSize: 16,
  },
  backButton: {marginLeft: 20, padding: 20, backgroundColor: '#E5E7EB', borderRadius: 10 , alignSelf: 'center' },
  backButtonText: { color: '#111827', fontWeight: 'bold' },
});
