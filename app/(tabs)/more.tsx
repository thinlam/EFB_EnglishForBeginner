/**
 * Dự án: EFB - English For Beginners
 * \* Mục đích: Xây dựng ứng dụng học tiếng Anh cơ bản.
 * người dùng: Người mới bắt đầu học tiếng Anh.
 * Chức năng: Đăng nhập, đăng ký, học từ vựng, ngữ pháp, luyện nghe nói.
 * Công nghệ: React Native, Expo, Firebase.
 * \* Tác giả: [NHÓM EFB]
 * Ngày tạo: 01/06/2025
 */

import { styles } from '@/components/style/MoreStyles';
import { auth } from '@/scripts/firebase';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import React from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function MoreScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user'); // xoá user local
      await signOut(auth); // đăng xuất Firebase
      router.replace('/login'); // về trang login
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể đăng xuất.');
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { icon: 'user', title: 'Thông tin cá nhân', path: '/profile' },
    { icon: 'calendar-alt', title: 'Lịch học & Kế hoạch', path: '/studyPlan' },
    { icon: 'crown', title: 'Nâng cấp Premium', path: '/premium' },
    { icon: 'cog', title: 'Cài đặt ứng dụng', path: '/settings' },
    { icon: 'envelope', title: 'Góp ý / Liên hệ', path: '/support' },
    // Đăng xuất sẽ dùng hàm riêng
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>cài đặt</Text>
      <ScrollView style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => router.push(item.path)}
          >
            <FontAwesome5 name={item.icon} size={20} color="#333" style={styles.icon} />
            <Text style={styles.menuText}>{item.title}</Text>
          </TouchableOpacity>
        ))}

        {/* Nút Đăng xuất riêng */}
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <FontAwesome5 name="sign-out-alt" size={20} color="#333" style={styles.icon} />
          <Text style={styles.menuText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
