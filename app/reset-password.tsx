/**
 * Dự án: EFB - English For Beginners
 * \* Mục đích: Xây dựng ứng dụng học tiếng Anh cơ bản.
 * người dùng: Người mới bắt đầu học tiếng Anh.
 * Chức năng: Đăng nhập, đăng ký, học từ vựng, ngữ pháp, luyện nghe nói.
 * Công nghệ: React Native, Expo, Firebase.
 * \* Tác giả: [NHÓM EFB]
 * Ngày tạo: 01/06/2025
 */

import { FontAwesome5 } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ResetPasswordScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    if (!email) {
      Alert.alert('Lỗi', 'Không tìm thấy email');
      return;
    }

    if (!password || !rePassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải từ 6 ký tự trở lên');
      return;
    }

    if (password !== rePassword) {
      Alert.alert('Lỗi', 'Mật khẩu không trùng khớp');
      return;
    }

    try {
      const res = await fetch('https://otp-server-production-6c26.up.railway.app/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword: password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        Alert.alert('✅ Thành công', 'Mật khẩu đã được cập nhật');
        router.replace('/login');
      } else {
        Alert.alert('❌ Lỗi', data.message || 'Không thể cập nhật mật khẩu');
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#f0f4ff',
      }}
    >
      <Text style={{
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#6C63FF',
        marginBottom: 24
      }}>
        🔐 Đặt lại mật khẩu
      </Text>

      <Text style={{ color: '#555', fontSize: 14, marginBottom: 10 }}>
        Email: <Text style={{ fontWeight: 'bold' }}>{email}</Text>
      </Text>

      {/* Mật khẩu mới */}
      <View style={{ position: 'relative', marginBottom: 16 }}>
        <TextInput
          placeholder="Nhập mật khẩu mới"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          style={{
            backgroundColor: '#fff',
            padding: 14,
            borderRadius: 10,
            fontSize: 16,
            shadowColor: '#ccc',
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 2,
          }}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={{ position: 'absolute', right: 14, top: 14 }}
        >
          <FontAwesome5 name={showPassword ? 'eye' : 'eye-slash'} size={18} color="#888" />
        </TouchableOpacity>
      </View>

      {/* Nhập lại mật khẩu */}
      <View style={{ position: 'relative', marginBottom: 32 }}>
        <TextInput
          placeholder="Nhập lại mật khẩu"
          secureTextEntry={!showRePassword}
          value={rePassword}
          onChangeText={setRePassword}
          style={{
            backgroundColor: '#fff',
            padding: 14,
            borderRadius: 10,
            fontSize: 16,
            shadowColor: '#ccc',
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 2,
          }}
        />
        <TouchableOpacity
          onPress={() => setShowRePassword(!showRePassword)}
          style={{ position: 'absolute', right: 14, top: 14 }}
        >
          <FontAwesome5 name={showRePassword ? 'eye' : 'eye-slash'} size={18} color="#888" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={handleReset}
        style={{
          backgroundColor: '#6C63FF',
          paddingVertical: 14,
          borderRadius: 10,
          shadowColor: '#6C63FF',
          shadowOpacity: 0.3,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 16 }}>
          💾 LƯU MẬT KHẨU
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
