import { db } from "@/scripts/firebase";
import { useRouter } from "expo-router";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Text,
    TouchableOpacity
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SpeakingSubmissions() {
  const router = useRouter();
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      const q = query(
        collection(db, "speaking_attempts"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);

      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setItems(data);
    })();
  }, []);

  const openDetail = (id: string) => {
    router.push(`/admin/speaking/submission-detail?id=${id}`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#020617" }}>
      <Text
        style={{
          color: "#fff",
          fontSize: 20,
          fontWeight: "700",
          padding: 16,
        }}
      >
        Bài luyện nói của học viên
      </Text>

      {!items.length ? (
        <ActivityIndicator color="#6366f1" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => openDetail(item.id)}
              style={{
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#1f2937",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600" }}>
                User: {item.userId}
              </Text>
              <Text style={{ color: "#9ca3af", marginTop: 4 }}>
                Bài: {item.lessonId} • {item.durationSec}s
              </Text>

              {item.teacherScore ? (
                <Text style={{ color: "#22c55e", marginTop: 4 }}>
                  Đã chấm: {item.teacherScore}/10
                </Text>
              ) : (
                <Text style={{ color: "#f59e0b", marginTop: 4 }}>
                  Chưa chấm
                </Text>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}
