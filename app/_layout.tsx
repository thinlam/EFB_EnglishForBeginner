/**
 * Dự án: EFB - English For Beginners
 * \* Mục đích: Xây dựng ứng dụng học tiếng Anh cơ bản.
 * người dùng: Người mới bắt đầu học tiếng Anh.
 * Chức năng: Đăng nhập, đăng ký, học từ vựng, ngữ pháp, luyện nghe nói.
 * Công nghệ: React Native, Expo, Firebase.
 * \* Tác giả: [NHÓM EFB]
 * Ngày tạo: 01/06/2025
 */

import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Tabs group */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* Màn phụ: Ẩn khỏi tab bar nhưng vẫn push/link được */}
      <Stack.Screen name="listen" options={{ headerShown: false }} />
      <Stack.Screen name="translate" options={{ headerShown: false }} />

      {/* Nếu có màn chỉnh sửa profile dạng nested path */}
      <Stack.Screen name="Profile/EditProfile" options={{ headerShown: false }} />
    </Stack>
  );
}

