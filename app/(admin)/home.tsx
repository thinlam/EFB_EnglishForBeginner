import { styles } from '@/components/style/HomeStyles';
import { useRouter } from 'expo-router';
import {
  SafeAreaView,
  ScrollView,
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

