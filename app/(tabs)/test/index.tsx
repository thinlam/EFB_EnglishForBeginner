// app/(tabs)/test/index.tsx
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function TestIndex() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>
        CEFR Tests
      </Text>

      {/* A1 Test */}
      <TouchableOpacity
        style={{
          padding: 20,
          backgroundColor: "#0EA5E9",
          borderRadius: 12,
          marginBottom: 20,
        }}
        onPress={() => router.push("/test/A1")}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "#fff" }}>
          CEFR A1 – Test 01
        </Text>
        <Text style={{ color: "#E0F2FE", marginTop: 5 }}>
          Listening • Reading • Writing
        </Text>
      </TouchableOpacity>

      {/* Các test CEFR khác để sau */}
    </View>
  );
}
