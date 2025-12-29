// app/(tabs)/test/index.tsx

import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function TestIndex() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#F9FAFB",
        paddingTop: insets.top,
      }}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text
          style={{
            fontSize: 30,
            fontWeight: "700",
            color: "#111827",
            marginBottom: 8,
          }}
        >
          CEFR Placement Tests
        </Text>

        <Text
          style={{
            fontSize: 15,
            color: "#6B7280",
            marginBottom: 24,
          }}
        >
          Assess your English proficiency by CEFR standards
        </Text>

        {/* ===== A1 CARD ===== */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push("/test/A1")}
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 4,
          }}
        >
          {/* Level badge */}
          <View
            style={{
              alignSelf: "flex-start",
              backgroundColor: "#E0F2FE",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 999,
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                color: "#0284C7",
                fontWeight: "600",
                fontSize: 12,
              }}
            >
              CEFR A1 • Beginner
            </Text>
          </View>

          {/* Title */}
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: "#111827",
              marginBottom: 6,
            }}
          >
            English Test – Level A1
          </Text>

          {/* Skills */}
          <Text
            style={{
              fontSize: 14,
              color: "#6B7280",
              marginBottom: 14,
            }}
          >
            Listening • Reading • Writing
          </Text>

          {/* Meta info */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 13, color: "#374151" }}>
              ⏱ 30 minutes
            </Text>
            <Text style={{ fontSize: 13, color: "#374151" }}>
              📊 30 questions
            </Text>
          </View>

          {/* CTA */}
          <View
            style={{
              backgroundColor: "#0EA5E9",
              borderRadius: 10,
              paddingVertical: 12,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Start Test
            </Text>
          </View>
        </TouchableOpacity>

        {/* Placeholder cho A2+ */}
        <View
          style={{
            backgroundColor: "#F3F4F6",
            borderRadius: 16,
            padding: 20,
            opacity: 0.6,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: "#6B7280",
            }}
          >
            CEFR A2 – Elementary
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#9CA3AF",
              marginTop: 6,
            }}
          >
            Unlock after completing A1
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
