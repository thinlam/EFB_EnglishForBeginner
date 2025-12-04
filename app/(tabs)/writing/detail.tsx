// app/(tabs)/writing/detail.tsx

import { WritingDetailStyles as S } from "@/components/style/user/writing/WritingDetailStyles";
import { db } from "@/scripts/firebase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function WritingDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSample, setShowSample] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db, "writing_lessons", String(id)));
        if (snap.exists()) {
          setTask(snap.data());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [id]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
        <Text style={{ textAlign: "center", fontSize: 16, color: "#555" }}>
          Không tìm thấy bài Writing này.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[S.startBtn, { marginTop: 20 }]}
        >
          <Text style={S.startText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={S.container}>
      {/* IMAGE */}
      {task.imageUrl ? (
        <Image source={{ uri: task.imageUrl }} style={S.image} />
      ) : null}

      {/* TITLE */}
      <Text style={S.title}>{task.title}</Text>

      {/* PROMPT */}
      <Text style={S.label}>Prompt</Text>
      <Text style={S.text}>{task.prompt}</Text>

      {/* TIPS */}
      {task.writingTips ? (
        <>
          <Text style={S.label}>Tips</Text>
          <Text style={S.tips}>{task.writingTips}</Text>
        </>
      ) : null}

      {/* SAMPLE */}
      <TouchableOpacity onPress={() => setShowSample(!showSample)}>
        <Text style={S.sampleToggle}>
          {showSample ? "Ẩn sample" : "Xem sample"}
        </Text>
      </TouchableOpacity>

      {showSample && (
        <Text style={S.sample}>{task.sampleAnswer || "(Không có sample)"}</Text>
      )}

      {/* BUTTON */}
      <TouchableOpacity
        style={S.startBtn}
        onPress={() =>
          router.push({
            pathname: "/writing/editor",
            params: { id },
          })
        }
      >
        <Text style={S.startText}>Bắt đầu viết</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
