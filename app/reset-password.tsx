import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity } from 'react-native';

export default function ResetPasswordScreen() {
  const { email } = useLocalSearchParams();
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const router = useRouter();

  const handleReset = async () => {
    if (password !== rePassword) {
      Alert.alert('Lỗi', 'Mật khẩu không trùng khớp');
      return;
    }

    try {
      console.log(`Đổi mật khẩu cho ${email}`);
      Alert.alert('Thành công', 'Mật khẩu đã được cập nhật');
      router.replace('/login');
    } catch (err: any) {
      Alert.alert('Lỗi', err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f8f9ff' }}
    >
      <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#6C63FF', marginBottom: 32 }}>
        🔐 Reset mật khẩu
      </Text>

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
