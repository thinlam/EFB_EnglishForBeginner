import { useRouter } from 'expo-router';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity
} from 'react-native';

export default function AdminHomeScreen() {
  const router = useRouter();

  const features = [
    { title: ' Quản lý người dùng', path: '/(admin)/user-list' },
    { title: ' Quản lý từ vựng', path: '/(admin)/vocabulary' },
    { title: ' Quản lý ngữ pháp',  path: '/(admin)/grammar'},
    { title: ' Quản lý luyện nghe' },
    { title: ' Quản lý trò chơi' },
    { title: ' Quản lý bài kiểm tra' },
    { title: ' Thống kê & Xếp hạng' },
    { title: ' Gửi thông báo' },
    { title: ' Cài đặt hệ thống', path: '/(admin)/system-setting' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}> Trang quản trị</Text>

        {features.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => item.path && router.push(item.path)}
            activeOpacity={0.85}
          >
            <Text style={styles.cardText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 30,
    color: '#111827',
  },
  card: {
    backgroundColor: '#6366F1',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
