/**
 * Dự án: EFB - English For Beginners
 * \* Mục đích: Xây dựng ứng dụng học tiếng Anh cơ bản.
 * người dùng: Người mới bắt đầu học tiếng Anh.
 * Chức năng: Đăng nhập, đăng ký, học từ vựng, ngữ pháp, luyện nghe nói.
 * Công nghệ: React Native, Expo, Firebase.
 * \* Tác giả: [NHÓM EFB]
 * Ngày tạo: 01/06/2025
 */

import { styles } from '@/components/style/PremiumStyles'; // Import styles from the PremiumStyles file
import React from 'react';
import { Text, View } from 'react-native';

export default function PremiumScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>💎 Premium</Text>
    </View>
  );
}

