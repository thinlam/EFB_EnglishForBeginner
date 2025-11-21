/**
 * Dự án: EFB - English For Beginners
 * Mục đích: Điều hướng đúng sau khi đăng nhập
 */

import { useAuthProfile } from '@/hooks/tab/useAuthProfile';
import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const raw = useAuthProfile() as any;

  // hook có thể trả { profile, loading } hoặc trả profile trực tiếp
  const profile =
    raw?.profile ?? raw?.user ?? raw?.userData ?? raw ?? null;

  const loading = raw?.loading ?? false;

  // Loading Firebase profile → show spinner
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // ❌ chưa đăng nhập → đưa về Welcome
  if (!profile) {
    return <Redirect href="/Welcome" />;
  }

  const role = profile.role ?? 'user';

  // 👑 Admin vào zone admin
  if (role === 'admin') {
    return <Redirect href="/admin" />;
  }

  // ⭐ Premium và User đều vào tabs
  if (role === 'premium' || role === 'user') {
    return <Redirect href="/" />;
  }

  // fallback
  return <Redirect href="/" />;
}
