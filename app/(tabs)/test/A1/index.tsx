import { db } from "@/scripts/firebase";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function TestA1List() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTests = async () => {
      try {
        const ref = collection(db, "tests_cefr", "A1", "pools");
        const snap = await getDocs(ref);
        setTests(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } finally {
        setLoading(false);
      }
    };
    loadTests();
  }, []);

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          backgroundColor: "#F9FAFB",
        }}
      >
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12, color: "#6B7280" }}>
          Đang tải bài kiểm tra...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 32,
        }}
      >
        {/* Header */}
        <Text
          style={{
            fontSize: 28,
            fontWeight: "700",
            color: "#111827",
            marginBottom: 6,
          }}
        >
          Chọn bài test A1
        </Text>

        <Text
          style={{
            fontSize: 15,
            color: "#6B7280",
            marginBottom: 24,
          }}
        >
          Cấp độ Beginner • Chuẩn CEFR
        </Text>

        {/* Test list */}
        {tests.map((t, index) => (
          <TouchableOpacity
            key={t.id}
            activeOpacity={0.9}
            onPress={() =>
              router.push({
                pathname: "/test/A1/do-test",
                params: { testId: t.id },
              })
            }
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
              elevation: 4,
            }}
          >
            {/* Badge */}
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
                  fontSize: 12,
                  fontWeight: "600",
                  color: "#0284C7",
                }}
              >
                CEFR A1 • Test {index + 1}
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
              {t?.title || `Bài kiểm tra A1`}
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

            {/* Meta */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <Text style={{ fontSize: 13, color: "#374151" }}>
                ⏱ ~30 phút
              </Text>
              <Text style={{ fontSize: 13, color: "#374151" }}>
                📊 30 câu hỏi
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
                Bắt đầu làm bài
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
