/**
 * Project: EFB - English For Beginners
 * Purpose: Basic English learning application.
 * Users: English beginners.
 * Features: Login, register, vocabulary, grammar, listening & speaking practice.
 * Tech stack: React Native, Expo, Firebase.
 * Author: EFB Team
 * Created: 01/06/2025
 */

import { FontAwesome5 } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

export default function ResetPasswordScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const router = useRouter();

  const showError = (title: string, message: string) => {
    Toast.show({
      type: 'error',
      position: 'top',
      text1: title,
      text2: message,
      visibilityTime: 8000,
      autoHide: true,
      topOffset: 60,
    });
  };

  const showSuccess = (title: string, message: string) => {
    Toast.show({
      type: 'success',
      position: 'top',
      text1: title,
      text2: message,
      visibilityTime: 8000,
      autoHide: true,
      topOffset: 60,
    });
  };

  const handleReset = async () => {
    if (!email) {
      showError('Error', 'Email not found.');
      return;
    }

    if (!password || !rePassword) {
      showError('Missing information', 'Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      showError(
        'Weak password',
        'Password must be at least 6 characters long.'
      );
      return;
    }

    if (password !== rePassword) {
      showError('Password mismatch', 'Passwords do not match.');
      return;
    }

    try {
      const res = await fetch(
        'https://otp-server-production-6c26.up.railway.app/reset-password',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, newPassword: password }),
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        showSuccess('Success', 'Your password has been updated.');
        router.replace('/login');
      } else {
        showError('Error', data.message || 'Unable to update password.');
      }
    } catch (err) {
      showError('Error', 'Unable to connect to the server.');
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
      <Text
        style={{
          fontSize: 24,
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#6C63FF',
          marginBottom: 24,
        }}
      >
        🔐 Reset Password
      </Text>

      <Text style={{ color: '#555', fontSize: 14, marginBottom: 10 }}>
        Email: <Text style={{ fontWeight: 'bold' }}>{email}</Text>
      </Text>

      {/* New password */}
      <View style={{ position: 'relative', marginBottom: 16 }}>
        <TextInput
          placeholder="Enter new password"
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
          <FontAwesome5
            name={showPassword ? 'eye' : 'eye-slash'}
            size={18}
            color="#888"
          />
        </TouchableOpacity>
      </View>

      {/* Confirm password */}
      <View style={{ position: 'relative', marginBottom: 32 }}>
        <TextInput
          placeholder="Re-enter password"
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
          <FontAwesome5
            name={showRePassword ? 'eye' : 'eye-slash'}
            size={18}
            color="#888"
          />
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
        <Text
          style={{
            color: 'white',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: 16,
          }}
        >
          💾 SAVE PASSWORD
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
