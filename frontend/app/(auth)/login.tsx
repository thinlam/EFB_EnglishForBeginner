import { styles } from '@/components/style/auth/LoginStyles';
import { useLogin } from '@/hooks/auth/useLogin';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const {
    identifier,
    setIdentifier,
    password,
    setPassword,
    loading,
    showPassword,
    setShowPassword,
    handleLogin,
    handleGooglePress,
    handleForgotPassword,
  } = useLogin({ router });

  return (
    <View style={styles.container}>
      {/* ===== HEADER ===== */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/Welcome')}
        >
          <Text style={styles.backText}>⬅ BACK</Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          WELCOME{'\n'}EFB
        </Text>
      </View>

      {/* ===== EMAIL / USERNAME ===== */}
      <Text style={styles.label}>EMAIL OR USERNAME</Text>
      <TextInput
        placeholder="your@gmail.com or username"
        style={styles.input}
        value={identifier}
        onChangeText={setIdentifier}
        placeholderTextColor="#888"
        autoCapitalize="none"
      />

      {/* ===== PASSWORD ===== */}
      <Text style={styles.label}>PASSWORD</Text>
      <View style={{ position: 'relative' }}>
        <TextInput
          placeholder="••••••••••••••••••"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor="#888"
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={{ position: 'absolute', right: 12, top: 12 }}
        >
          <FontAwesome5
            name={showPassword ? 'eye' : 'eye-slash'}
            size={18}
            color="#888"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleForgotPassword}>
        <Text
          style={[
            styles.switch,
            { textAlign: 'right', marginTop: -10 },
          ]}
        >
          Forgot password?
        </Text>
      </TouchableOpacity>

      {/* ===== SIGN IN ===== */}
      <TouchableOpacity
        style={[styles.button, { opacity: loading ? 0.6 : 1 }]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Processing...' : 'Sign in'}
        </Text>
      </TouchableOpacity>

      {/* ===== SIGN UP ===== */}
      <Text
        style={styles.switch}
        onPress={() => router.push('/register')}
      >
        You do not have an account ? Sign up
      </Text>

      {/* ===== OR ===== */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 24,
        }}
      >
        <View style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
        <Text style={{ marginHorizontal: 10, color: '#999' }}>OR</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
      </View>

      {/* ===== GOOGLE ===== */}
      <TouchableOpacity
        style={[
          styles.socialButton,
          {
            backgroundColor: '#fff',
            borderWidth: 1,
            borderColor: '#ccc',
            opacity: loading ? 0.6 : 1,
          },
        ]}
        onPress={handleGooglePress}
        disabled={loading}
      >
        <FontAwesome5
          name="google"
          size={20}
          color="#DB4437"
          style={styles.socialIcon}
        />
        <Text style={[styles.socialText, { color: '#444' }]}>
          Google Sign in
        </Text>
      </TouchableOpacity>

      {/* ===== FACEBOOK (DISABLED) ===== */}
      <TouchableOpacity
        style={[
          styles.socialButton,
          { backgroundColor: '#1877F2', opacity: 0.6 },
        ]}
        disabled
      >
        <FontAwesome5
          name="facebook-f"
          size={20}
          color="#fff"
          style={styles.socialIcon}
        />
        <Text style={styles.socialText}>Facebook Sign in</Text>
      </TouchableOpacity>

      {/* ===== TRUST CARD ===== */}
      <View
        style={{
          marginTop: 24,
          padding: 14,
          borderRadius: 12,
          backgroundColor: '#F7F8FF',
          borderWidth: 1,
          borderColor: '#E3E6FF',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ color: '#4F46E5', marginRight: 8 }}>✓</Text>
          <Text style={{ color: '#555', fontSize: 13 }}>
            Learn English by CEFR (A1–B1)
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ color: '#4F46E5', marginRight: 8 }}>✓</Text>
          <Text style={{ color: '#555', fontSize: 13 }}>
            Practice with mini games & tests
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: '#4F46E5', marginRight: 8 }}>✓</Text>
          <Text style={{ color: '#555', fontSize: 13 }}>
            Track progress & earn EXP
          </Text>
        </View>
      </View>

      {/* ===== FOOTER ===== */}
      <View
        style={{
          marginTop: 20,
          alignItems: 'center',
          paddingBottom: 12,
          opacity: 0.4,
        }}
      >
        <Text style={{ fontSize: 11 }}>English For Beginner</Text>
        <Text style={{ fontSize: 11 }}>Version 1.0.0</Text>
        <Text style={{ fontSize: 11 }}>© 2026 EFB Team</Text>
      </View>
    </View>
  );
}
