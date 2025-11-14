// app/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';
export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="listen" options={{ headerShown: false }} />
      <Stack.Screen name="translate" options={{ headerShown: false }} />
      <Stack.Screen name="Profile/EditProfile" options={{ headerShown: false }} />
    </Stack>
  );
}