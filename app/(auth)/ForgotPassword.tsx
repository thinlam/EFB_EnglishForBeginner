import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [sentOtp, setSentOtp] = useState(false);
  const [serverOtp, setServerOtp] = useState('');
  const router = useRouter();

  const sendOtp = async () => {
    if (!email.includes('@')) {
      Alert.alert('Lỗi', 'Vui lòng nhập email hợp lệ.');
      return;
    }

    try {
      const res = await fetch('https://otp-server-production-6c26.up.railway.app/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSentOtp(true);
        setServerOtp(data.otp);
        Alert.alert('Thành công', 'OTP đã được gửi đến Gmail của bạn');
      } else {
        Alert.alert('Lỗi', data.message || 'Không gửi được OTP');
      }
    } catch (err) {
      console.error('Lỗi gửi OTP:', err);
      Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ');
    }
  };

  const verifyOtp = () => {
    if (otp === serverOtp) {
      router.push({
        pathname: '/reset-password',
        params: { email },
      });
    } else {
      Alert.alert('Sai mã', 'Mã OTP không đúng');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{
        flex: 1,
        backgroundColor: '#f8f9ff',
        padding: 24,
      }}
    >
      {/* Nút Quay lại */}
     

      {/* Form nhập */}
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8, color: '#333' }}>
          🔐 Nhập Gmail để nhận mã OTP
        </Text>
        <TextInput
          placeholder="example@gmail.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
           placeholderTextColor={'#888'}
          style={{
            backgroundColor: '#fff',
            padding: 14,
            borderRadius: 10,
            fontSize: 16,
            shadowColor: '#ccc',
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 2,
            marginBottom: 20,
          }}
        />

        {sentOtp && (
          <>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#444' }}>
              📩 Nhập mã OTP vừa nhận
            </Text>
            <TextInput
              placeholder="Nhập mã OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
              placeholderTextColor={'#888'}
              style={{
                backgroundColor: '#fff',
                padding: 14,
                borderRadius: 10,
                fontSize: 16,
                shadowColor: '#ccc',
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 2,
                marginBottom: 20,
              }}
            />
          </>
        )}

        <TouchableOpacity
          onPress={sentOtp ? verifyOtp : sendOtp}
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
            {sentOtp ? 'XÁC NHẬN OTP' : 'GỬI MÃ VỀ GMAIL'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace('/login')}>
  <Text style={{ color: '#6C63FF', fontSize: 17,fontWeight: 'bold', textAlign: 'center' }}>⬅ Quay lại trang đăng nhập</Text>
</TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
