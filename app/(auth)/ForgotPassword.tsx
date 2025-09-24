import { useRouter } from 'expo-router';
import React from 'react';
import {
  KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View,
} from 'react-native';

/* Styles */
import { styles } from '@/components/style/auth/ForgotPasswordStyles';

/* Hook */
import { useForgotPassword } from '@/hooks/auth/useForgotPassword';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const {
    email, setEmail,
    otp, setOtp,
    sentOtp, loading, cooldown, OTP_LENGTH,
    titleText,
    sendOtp, verifyOtp,
  } = useForgotPassword({ onVerified: (email) => router.push({ pathname: '/reset-password', params: { email } }) });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.centerWrap}>
        <Text style={styles.title}>{titleText}</Text>

        {/* Email */}
        <TextInput
          placeholder="example@gmail.com"
          value={email}
          onChangeText={(t) => setEmail(t.trim())}
          keyboardType="email-address"
          placeholderTextColor="#888"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
          style={styles.input}
        />
        <Text style={styles.helper}>Nhập email đã đăng ký để nhận mã OTP (mã có hiệu lực trong ít phút).</Text>

        {/* OTP */}
        {sentOtp && (
          <>
            <Text style={styles.otpLabel}>📩 Nhập mã OTP vừa nhận</Text>
            <TextInput
              placeholder={`Nhập ${OTP_LENGTH} số OTP`}
              value={otp}
              onChangeText={(t) => setOtp(t.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH))}
              keyboardType="numeric"
              placeholderTextColor="#888"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={OTP_LENGTH}
              editable={!loading}
              style={styles.otpInput}
            />
          </>
        )}

        {/* Main button */}
        <TouchableOpacity
          onPress={sentOtp ? verifyOtp : sendOtp}
          disabled={loading}
          style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
        >
          <Text style={styles.primaryBtnText}>
            {loading ? (sentOtp ? 'ĐANG XÁC NHẬN...' : 'ĐANG GỬI...') : (sentOtp ? 'XÁC NHẬN OTP' : 'GỬI MÃ VỀ GMAIL')}
          </Text>
        </TouchableOpacity>

        {/* Resend */}
        {sentOtp && (
          <TouchableOpacity onPress={sendOtp} disabled={loading || cooldown > 0} style={{ marginBottom: 16 }}>
            <Text style={{ textAlign: 'center', color: (loading || cooldown > 0) ? '#aaa' : '#6C63FF', fontWeight: '600' }}>
              {cooldown > 0 ? `Gửi lại OTP sau ${cooldown}s` : 'Gửi lại OTP'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Back to login */}
        <TouchableOpacity onPress={() => router.replace('/login')}>
          <Text style={styles.backLink}>⬅ Quay lại trang đăng nhập</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
