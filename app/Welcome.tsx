/**
 * Dự án: EFB - English For Beginners
 * Mục đích: Xây dựng ứng dụng học tiếng Anh cơ bản.
 * Công nghệ: React Native, Expo, Firebase
 * Tác giả: NHÓM EFB
 * Ngày tạo: 01/06/2025
 */

import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import { styles } from '../components/style/WelcomStyles';

export default function WelcomeScreen() {
  const router = useRouter();
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Nội dung */}
      <View style={styles.content}>
        <Text style={styles.title}>
          WELCOME{'\n'}EFB
        </Text>

        <Text style={styles.subtitle}>ENGLISH FOR BEGINNER</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.buttonText}>Sign in</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.buttonText}>Sign up</Text>
        </TouchableOpacity>
      </View>

      {/* Version */}
      <Text style={styles.version}>Version {version}</Text>
    </View>
  );
}
