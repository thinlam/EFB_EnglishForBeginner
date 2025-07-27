import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';

export default function ResetPasswordScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
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
      <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#6C63FF', marginBottom: 24 }}>
        🔐 Đặt lại mật khẩu
      </Text>

      <Text style={{ color: '#555', fontSize: 14, marginBottom: 10 }}>Email: <Text style={{ fontWeight: 'bold' }}>{email}</Text></Text>

      <TextInput
        placeholder="Nhập mật khẩu mới"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{
          backgroundColor: '#fff',
          padding: 14,
          borderRadius: 10,
          fontSize: 16,
          marginBottom: 16,
          shadowColor: '#ccc',
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 2,
        }}
      />
      <TextInput
        placeholder="Nhập lại mật khẩu"
        secureTextEntry
        value={rePassword}
        onChangeText={setRePassword}
        style={{
          backgroundColor: '#fff',
          padding: 14,
          borderRadius: 10,
          fontSize: 16,
          marginBottom: 32,
          shadowColor: '#ccc',
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 2,
        }}
      />

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
