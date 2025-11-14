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
      {/* Header: Back + Title on same row */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/Welcome')}
        >
          <Text style={styles.backText}>⬅ BACK</Text>
        </TouchableOpacity>

        <Text style={styles.title}>WELCOME{'\n'}EFB
        </Text>
      </View>

      {/* Email / Username */}
      <Text style={styles.label}>EMAIL OR USERNAME</Text>
      <TextInput
        placeholder="your@gmail.com or username"
        style={styles.input}
        value={identifier}
        onChangeText={setIdentifier}
        placeholderTextColor="#888"
        autoCapitalize="none"
      />

      {/* Password */}
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

      {/* Sign in button */}
      <TouchableOpacity
        style={[styles.button, { opacity: loading ? 0.6 : 1 }]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Processing...' : 'Sign in'}
        </Text>
      </TouchableOpacity>

      {/* Sign up link */}
      <Text
        style={styles.switch}
        onPress={() => router.push('/register')}
      >
        You do not have an account ? Sign up
      </Text>

      {/* OR separator */}
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

      {/* Google sign-in */}
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

      {/* Facebook (disabled for now) */}
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
    </View>
  );
}
