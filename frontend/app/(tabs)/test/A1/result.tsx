import { saveTestResult } from "@/services/testResult.service";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function TestA1Result() {
  const router = useRouter();
  const { score, pass } = useLocalSearchParams();

  // ❗ chặn lưu trùng khi re-render
  const savedRef = useRef(false);

  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;

    const numericScore = Number(score) || 0;
    const isPass = pass === "true";

    saveTestResult({
      level: "A1",
      score: numericScore,
      pass: isPass,
    });
  }, []);

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ffffffff",
      }}
    >
      <Text
        style={{
          fontSize: 32,
          fontWeight: "bold",
          marginBottom: 20,
          color: "#FACC15",
        }}
      >
        Kết quả
      </Text>

      <Text style={{ fontSize: 24, marginBottom: 10, color: "#090909ff" }}>
        Điểm: {score}
      </Text>

      <Text
        style={{
          fontSize: 22,
          color: pass === "true" ? "#22C55E" : "#EF4444",
          marginBottom: 40,
          fontWeight: "600",
        }}
      >
        {pass === "true" ? "Đậu 🎉" : "Rớt 😢"}
      </Text>

      <TouchableOpacity
        onPress={() => router.replace("/test/A1")}
        style={{
          backgroundColor: "#0ea5e9",
          paddingVertical: 15,
          borderRadius: 14,
          width: "70%",
        }}
      >
        <Text
          style={{
            color: "#fff",
            textAlign: "center",
            fontSize: 18,
            fontWeight: "600",
          }}
        >
          Quay lại danh sách test
        </Text>
      </TouchableOpacity>
    </View>
  );
}
