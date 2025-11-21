// app/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

const BRAND_PURPLE = '#4F46E5';

const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: BRAND_PURPLE,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        // bóng cho card
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
      }}
      contentContainerStyle={{
        paddingHorizontal: 14,
        paddingVertical: 6,
      }}
      text1Style={{
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
      }}
      text2Style={{
        fontSize: 13,
        color: '#4B5563',
      }}
    />
  ),

  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: '#EF4444',
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOpacity: 0.16,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
      }}
      contentContainerStyle={{
        paddingHorizontal: 14,
        paddingVertical: 6,
      }}
      text1Style={{
        fontSize: 15,
        fontWeight: '700',
        color: '#B91C1C',
      }}
      text2Style={{
        fontSize: 13,
        color: '#374151',
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
