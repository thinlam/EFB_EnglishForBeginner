// ===============================
// SCREEN: Listen Questions – Create Questions for a Listen lesson
// ===============================

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { db } from "@/scripts/firebase";
import {
    addDoc,
    collection,
    doc,
    getDoc,
    serverTimestamp,
} from "firebase/firestore";

import { VideoView, useVideoPlayer } from "expo-video";

// ==========================
// TYPES
// ==========================
type QuestionKind = "mcq" | "fill" | "dictation" | "listen_segment";

type ListenDoc = {
  title: string;
  audioUrl: string;
  mediaType: string;
  transcript: string;
};

// ==========================
// COMPONENT
// ==========================
export default function ListenQuestions() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [listen, setListen] = useState<ListenDoc | null>(null);

  // Question states
  const [kind, setKind] = useState<QuestionKind>("mcq");
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);

  const [startSec, setStartSec] = useState<number | null>(null);
  const [endSec, setEndSec] = useState<number | null>(null);

  // ❗ FIX: phải là null, không được undefined
  const player = useVideoPlayer(null, (p) => {
    p.loop = false;
  });

  // ==========================
  // LOAD LESSON DATA
  // ==========================
  useEffect(() => {
    (async () => {
      try {
        if (!id) return;
        const snap = await getDoc(doc(db, "listens", id));

        if (!snap.exists()) {
          Alert.alert("Không tìm thấy bài nghe");
          router.back();
          return;
        }

        const data = snap.data() as ListenDoc;
        setListen(data);

        // ❗ FIX: gọi replace sau khi player tồn tại
        if (data.audioUrl) {
          player.replace(data.audioUrl);
        }

        setLoading(false);
      } catch (err) {
        Alert.alert("Lỗi", "Không tải được bài nghe");
        router.back();
      }
    })();
  }, [id]);

  // ==========================
  // SET START & END
  // ==========================
  const markStart = () => {
    const t = player.currentTime ?? 0;
    setStartSec(Math.round(t * 100) / 100);
  };

  const markEnd = () => {
    const t = player.currentTime ?? 0;
    setEndSec(Math.round(t * 100) / 100);
  };

  // ==========================
  // SAVE QUESTION
  // ==========================
  const saveQuestion = async () => {
    if (!prompt.trim()) return Alert.alert("Thiếu câu hỏi.");

    if (kind === "listen_segment" && (!startSec || !endSec)) {
      return Alert.alert("Hãy chọn đoạn Start/End từ audio.");
    }

    const payload: any = {
      kind,
      prompt: prompt.trim(),
      answer: answer.trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (kind === "mcq") payload.options = options;
    if (startSec !== null) payload.startSec = startSec;
    if (endSec !== null) payload.endSec = endSec;

    try {
      await addDoc(collection(db, "listens", id, "questions"), payload);

      Alert.alert("Đã thêm câu hỏi!");
      setPrompt("");
      setAnswer("");
      setOptions(["", "", "", ""]);
      setStartSec(null);
      setEndSec(null);
    } catch (e: any) {
      Alert.alert("Lỗi", e?.message ?? "Không lưu được câu hỏi");
    }
  };

  // ==========================
  // UI
  // ==========================
  if (loading || !listen) {
    return (
      <View style={{ marginTop: 60 }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
      {/* BACK */}
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={{ fontSize: 16, marginBottom: 14 }}>⬅ Quay lại</Text>
      </TouchableOpacity>

      {/* TITLE */}
      <Text style={{ fontSize: 24, fontWeight: "700" }}>
        Câu hỏi – {listen.title}
      </Text>

      {/* MEDIA PREVIEW */}
      <Text style={{ marginTop: 20, fontSize: 18, fontWeight: "600" }}>
        Audio / Video Preview
      </Text>

      <VideoView
        player={player}
        style={{
          width: "100%",
          height: 220,
          backgroundColor: "#000",
          borderRadius: 10,
          marginTop: 10,
        }}
        contentFit="contain"
      />

      <View style={{ flexDirection: "row", marginTop: 14 }}>
        <TouchableOpacity
          onPress={markStart}
          style={{
            flex: 1,
            padding: 12,
            marginRight: 6,
            backgroundColor: "#22c55e",
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#fff", textAlign: "center" }}>📍 Set Start</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={markEnd}
          style={{
            flex: 1,
            padding: 12,
            marginLeft: 6,
            backgroundColor: "#ef4444",
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#fff", textAlign: "center" }}>📍 Set End</Text>
        </TouchableOpacity>
      </View>

      <Text style={{ marginTop: 10, color: "#555" }}>
        Start: {startSec ?? "—"}s • End: {endSec ?? "—"}s
      </Text>

      {/* QUESTION TYPE */}
      <Text style={{ marginTop: 26, fontSize: 18, fontWeight: "600" }}>
        Loại câu hỏi
      </Text>

      <View style={{ flexDirection: "row", marginTop: 10, flexWrap: "wrap" }}>
        {(["mcq", "fill", "dictation", "listen_segment"] as QuestionKind[]).map(
          (t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setKind(t)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 8,
                backgroundColor: t === kind ? "#4f46e5" : "#e5e7eb",
                marginRight: 8,
                marginBottom: 8,
              }}
            >
              <Text style={{ color: t === kind ? "#fff" : "#111" }}>{t}</Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {/* PROMPT */}
      <Text style={{ marginTop: 20, fontSize: 16 }}>Câu hỏi</Text>
      <TextInput
        value={prompt}
        onChangeText={setPrompt}
        style={{
          backgroundColor: "#f3f4f6",
          padding: 12,
          borderRadius: 8,
          marginTop: 6,
        }}
        placeholder="Nhập câu hỏi…"
      />

      {/* MCQ OPTIONS */}
      {kind === "mcq" && (
        <>
          <Text style={{ marginTop: 20, fontSize: 16 }}>Các lựa chọn</Text>

          {options.map((o, idx) => (
            <TextInput
              key={idx}
              value={o}
              onChangeText={(v) => {
                const arr = [...options];
                arr[idx] = v;
                setOptions(arr);
              }}
              style={{
                backgroundColor: "#f3f4f6",
                padding: 12,
                borderRadius: 8,
                marginTop: 6,
              }}
              placeholder={`Option ${idx + 1}`}
            />
          ))}
        </>
      )}

      {/* ANSWER */}
      <Text style={{ marginTop: 20, fontSize: 16 }}>Đáp án</Text>
      <TextInput
        value={answer}
        onChangeText={setAnswer}
        style={{
          backgroundColor: "#f3f4f6",
          padding: 12,
          borderRadius: 8,
          marginTop: 6,
        }}
        placeholder="Nhập đáp án…"
      />

      {/* Segment preview */}
      {kind === "listen_segment" && (
        <Text style={{ marginTop: 10, fontSize: 15, color: "#333" }}>
          Đoạn trích: {startSec ?? "—"}s → {endSec ?? "—"}s
        </Text>
      )}

      {/* SAVE BUTTON */}
      <TouchableOpacity
        onPress={saveQuestion}
        style={{
          marginTop: 28,
          marginBottom: 40,
          padding: 16,
          borderRadius: 10,
          backgroundColor: "#4f46e5",
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontSize: 16 }}>
          Lưu câu hỏi
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
