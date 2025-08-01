import { styles } from '@/components/style/HomeStyles';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AdminHomeScreen() {
  const router = useRouter();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const features = [
    {
      title: '🎓 Quản lý nội dung học',
      children: [
        { title: 'Từ vựng', path: '/(admin)/vocabulary' },
        { title: 'Ngữ pháp', path: '/(admin)/grammar' },
        { title: 'Luyện nghe' },
        { title: 'Trò chơi' },
        { title: 'Bài kiểm tra' },
      ],
    },
    
    {
      title: '📊 Thống kê & Thông báo',
      children: [
        { title: 'Thống kê & Xếp hạng' },
        { title: 'Gửi thông báo' },
      ],
    },
    {
      title: '👥 Người dùng & Hệ thống',
      children: [
        { title: 'Quản lý người dùng', path: '/(admin)/user-list' },
        { title: 'Cài đặt hệ thống', path: '/(admin)/system-setting' },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Trang quản trị</Text>

        {features.map((item, index) => (
          <View key={index}>
            {/* Mục chính */}
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                setExpandedMenu(expandedMenu === item.title ? null : item.title)
              }
              activeOpacity={0.85}
            >
              <Text style={styles.cardText}>{item.title}</Text>
            </TouchableOpacity>

            {/* Mục con */}
            {expandedMenu === item.title &&
              item.children?.map((child, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.cardSubItem}
                  onPress={() => child.path && router.push(child.path)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cardSubText}>• {child.title}</Text>
                </TouchableOpacity>
              ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
