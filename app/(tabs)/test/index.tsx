// app/(tabs)/test/index.tsx

import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function TestIndex() {
  const router = useRouter();
  const insets = useSafeAreaInsets(); // 🔥 lấy padding thật của notch/giọt nước

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: insets.top, // tránh tai thỏ iPhone
      }}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 40, // tránh giọt nước Android + spacing cho UI thoáng
        }}
        showsVerticalScrollIndicator={false}
      >
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
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "#fff",
            }}
          >
            CEFR A1 – Test 01
          </Text>

          <Text style={{ color: "#E0F2FE", marginTop: 5 }}>
            Listening • Reading • Writing
          </Text>
        </TouchableOpacity>

        {/* Các test CEFR khác */}
      </ScrollView>
    </SafeAreaView>
  );
}
