// app/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#22c55e', borderRadius: 12 }}
      contentContainerStyle={{ paddingHorizontal: 12 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '700',
      }}
      text2Style={{
        fontSize: 13,
      }}
    />
  ),

  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: '#ef4444', borderRadius: 12 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '700',
      }}
      text2Style={{
        fontSize: 13,
      }}
    />
  ),
};

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="listen" />
        <Stack.Screen name="translate" />
        <Stack.Screen name="Profile/EditProfile" />
      </Stack>

      {/* 🔔 Global toast notification */}
      <Toast config={toastConfig} />
    </>
  );
}
