import { styles } from '@/components/style/auth/LoginStyles';
import { useLogin } from '@/hooks/auth/useLogin';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const {
    identifier, setIdentifier,
    password, setPassword,
    loading, showPassword, setShowPassword,
    handleLogin, handleGooglePress, handleForgotPassword,
  } = useLogin({ router });

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/Welcome')}>
        <Text style={styles.backText}>⬅ Quay lại</Text>
      </TouchableOpacity>

      <Text style={styles.title}>WELCOME{"\n"}EFB</Text>

      <Text style={styles.label}>EMAIL HOẶC USERNAME</Text>
      <TextInput
        placeholder="your@gmail.com hoặc username"
        style={styles.input}
        value={identifier}
        onChangeText={setIdentifier}
        placeholderTextColor={'#888'}
        autoCapitalize="none"
      />

      <Text style={styles.label}>PASSWORD</Text>
      <View style={{ position: 'relative' }}>
        <TextInput
          placeholder="••••••••••••••••••"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor={'#888'}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: 12 }}>
          <FontAwesome5 name={showPassword ? 'eye' : 'eye-slash'} size={18} color="#888" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleForgotPassword}>
        <Text style={[styles.switch, { textAlign: 'right', marginTop: -10 }]}>Quên mật khẩu?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { opacity: loading ? 0.6 : 1 }]} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Đang xử lý...' : 'Sign in'}</Text>
      </TouchableOpacity>

      <Text style={styles.switch} onPress={() => router.push('/register')}>chưa có tài khoản? Đăng ký ngay</Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 24 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
        <Text style={{ marginHorizontal: 10, color: '#999' }}>hoặc</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
      </View>

      <TouchableOpacity
        style={[styles.socialButton, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', opacity: loading ? 0.6 : 1 }]}
        onPress={handleGooglePress}
        disabled={loading}
      >
        <FontAwesome5 name="google" size={20} color="#DB4437" style={styles.socialIcon} />
        <Text style={[styles.socialText, { color: '#444' }]}>Google Sign in</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#1877F2', opacity: 0.6 }]} disabled>
        <FontAwesome5 name="facebook-f" size={20} color="#fff" style={styles.socialIcon} />
        <Text style={styles.socialText}>Facebook Sign in</Text>
      </TouchableOpacity>
    </View>
  );
}
