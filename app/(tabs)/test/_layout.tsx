import { Stack } from "expo-router";
import React from "react";

export default function TestLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
