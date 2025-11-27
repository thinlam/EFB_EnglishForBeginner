import { db } from "@/scripts/firebase";
import { Audio } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    doc,
    getDoc,
    updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SubmissionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState("");
  const [comment, setComment] = useState("");
  const [sound, setSound] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const ref = doc(db, "speaking_attempts", id);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        Alert.alert("Không tìm thấy bài nộp!");
        router.back();
        return;
      }
      const data = snap.data();

      setItem({ id, ...data });
      setScore(data.teacherScore ? String(data.teacherScore) : "");
      setComment(data.teacherComment ?? "");
      setLoading(false);
    })();
  }, []);

  const playAudio = async () => {
    if (!item?.audioUrl) {
      Alert.alert("Không có file audio");
      return;
    }

    const { sound } = await Audio.Sound.createAsync({
      uri: item.audioUrl,
    });

    setSound(sound);
    await sound.playAsync();
  };

  const save = async () => {
    const ref = doc(db, "speaking_attempts", id);
    await updateDoc(ref, {
      teacherScore: Number(score),
      teacherComment: comment,
    });

    Alert.alert("Đã lưu chấm điểm");
  };

  if (loading) {
    return (
      <ActivityIndicator color="#6366f1" style={{ marginTop: 30 }} />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#020617", padding: 16 }}>
      <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>
        Chấm bài luyện nói
      </Text>

      <View style={{ marginTop: 20 }}>
        <Text style={{ color: "#9ca3af" }}>
          Học viên: {item.userId}
        </Text>
        <Text style={{ color: "#9ca3af", marginTop: 4 }}>
          Bài: {item.lessonId}
        </Text>
        <Text style={{ color: "#9ca3af", marginTop: 4 }}>
          Thời lượng: {item.durationSec}s
        </Text>

        <TouchableOpacity
          onPress={playAudio}
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 10,
            backgroundColor: "#111827",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons name="play" size={18} color="#fff" />
          <Text style={{ color: "#fff", marginLeft: 8 }}>
            Nghe lại audio
          </Text>
        </TouchableOpacity>

        {/* Score */}
        <TextInput
          placeholder="Điểm (0–10)"
          placeholderTextColor="#6b7280"
          keyboardType="numeric"
          value={score}
          onChangeText={setScore}
          style={{
            marginTop: 20,
            backgroundColor: "#111827",
            color: "#fff",
            padding: 10,
            borderRadius: 8,
          }}
        />

        {/* Comment */}
        <TextInput
          placeholder="Nhận xét của giáo viên"
          placeholderTextColor="#6b7280"
          value={comment}
          onChangeText={setComment}
          multiline
          style={{
            marginTop: 12,
            minHeight: 100,
            backgroundColor: "#111827",
            color: "#fff",
            padding: 10,
            borderRadius: 8,
          }}
        />

        <TouchableOpacity
          onPress={save}
          style={{
            marginTop: 20,
            backgroundColor: "#4f46e5",
            padding: 12,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>
            Lưu chấm điểm
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
