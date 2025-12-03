import { styles } from '@/components/style/HomeStyles';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';

import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function AdminHomeScreen() {
  const router = useRouter();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const features = [
    {
      title: '🎓 Quản lý nội dung học',
      children: [
        { title: 'Luyện nghe',path: '/(admin)/listen/listen-screen' },
        { title: 'Luyện nói', path: '/(admin)/speaking/speaking-screen' },
        { title: 'Luyện đọc', path: '/(admin)/reading/reading-screen'},
        { title: 'Luyện viết' },
      { title: 'Bài kiểm tra', path: '/(admin)/testList' },

      ],
    },
    {
  title: '🗓️ Lịch học & Kế hoạch',
  children: [
    { title: 'Quản lý lịch học', path: '/(admin)/schedule' },
    { title: 'Kế hoạch học tập', path: '/(admin)/learning-plan' },
  ],
},
    {
      title: '📚 Tài liệu & Hỗ trợ',
      children: [
        { title: 'Tài liệu học tập', path: '/(admin)/study-materials' },
        { title: 'Hỗ trợ kỹ thuật', path: '/(admin)/support' },
      ],
    },
    {
  title: '💰 Điểm & Thưởng',
  children: [
    { title: 'Quản lý coin', path: '/(admin)/coin' },
    { title: 'Phần thưởng / Xếp hạng', path: '/(admin)/rewards' },
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
  title: '💎 Quản lý - Giao dịch - Nâng cấp',
  children: [
    { title: 'Quản lý gói Premium', path: '/(admin)/premium' },

    { title: 'Giao dịch & Nâng cấp', path: '/(admin)/transactions' },
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
                  onPress={() => child.path && router.push(child.path as any)}
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
