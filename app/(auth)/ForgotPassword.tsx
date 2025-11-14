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
        <Text style={styles.helper}>Enter your registered email to receive an OTP code (code valid for a few minutes).</Text>

        {/* OTP */}
        {sentOtp && (
          <>
            <Text style={styles.otpLabel}>📩 Enter the OTP code </Text>
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
            {loading ? (sentOtp ? 'CONFIRMING...' : 'SENDING...') : (sentOtp ? 'XÁC NHẬN OTP CONFIRMATION' : 'SEND CODE TO GMAIL')}
          </Text>
        </TouchableOpacity>

        {/* Resend */}
        {sentOtp && (
          <TouchableOpacity onPress={sendOtp} disabled={loading || cooldown > 0} style={{ marginBottom: 16 }}>
            <Text style={{ textAlign: 'center', color: (loading || cooldown > 0) ? '#aaa' : '#6C63FF', fontWeight: '600' }}>
              {cooldown > 0 ? `Resend OTP later ${cooldown}s` : 'Resend OTP'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Back to login */}
        <TouchableOpacity onPress={() => router.replace('/login')}>
          <Text style={styles.backLink}>⬅ Back Sign in </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
