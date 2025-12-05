// app/(tabs)/test/A1/index.tsx

import { db } from "@/scripts/firebase";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity
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
        }}
      >
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Đang tải bài kiểm tra...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#fff",
      }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,

          // ⭐ Nằm ngay dưới tai thỏ, không sát quá cũng không tụt quá
          paddingTop: insets.top + 8,

          // ⭐ Tránh giọt nước Android, và chân màn hình iPhone
          paddingBottom: insets.bottom + 20,
        }}
      >
        <Text style={{ fontSize: 26, fontWeight: "bold", marginBottom: 20 }}>
          Chọn bài test A1
        </Text>

        {tests.map((t) => (
          <TouchableOpacity
            key={t.id}
            onPress={() =>
              router.push({
                pathname: "/test/A1/do-test",
                params: { testId: t.id },
              })
            }
            style={{
              padding: 20,
              backgroundColor: "#e0f2fe",
              marginBottom: 15,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#38bdf8",
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "600" }}>
              {t?.title || `Test ${t.id}`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
