// app/(tabs)/test/A1/result.tsx
import React from "react";

import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function TestA1Result() {
  const router = useRouter();
  const { score, pass } = useLocalSearchParams();

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 32, fontWeight: "bold", marginBottom: 20 }}>
        Kết quả
      </Text>

      <Text style={{ fontSize: 24, marginBottom: 10 }}>Điểm: {score}</Text>

      <Text
        style={{
          fontSize: 22,
          color: pass === "true" ? "green" : "red",
          marginBottom: 40,
        }}
      >
        {pass === "true" ? "Đậu 🎉" : "Rớt 😢"}
      </Text>

      <TouchableOpacity
        onPress={() => router.replace("/test/A1")}
        style={{
          backgroundColor: "#0ea5e9",
          padding: 15,
          borderRadius: 12,
          width: "70%",
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontSize: 18 }}>
          Quay lại danh sách test
        </Text>
      </TouchableOpacity>
    </View>
  );
}
