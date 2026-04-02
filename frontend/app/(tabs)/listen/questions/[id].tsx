// app/(admin)/listen/listen-questions/[id].tsx
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
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { VideoView, useVideoPlayer } from "expo-video";

// =============================
// TYPES
// =============================
type QuestionKind = "mcq" | "fill" | "dictation" | "listen_segment";

type QuestionDoc = {
  id: string;
  kind: QuestionKind;
  prompt: string;
  answer: string;
  options?: string[];
  startSec?: number | null;
  endSec?: number | null;
};

type ListenDoc = {
  title: string;
  audioUrl: string;
  transcript?: string;
  mediaType?: string;
};

// =============================
// MAIN COMPONENT
// =============================
export default function ListenQuestions() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [listen, setListen] = useState<ListenDoc | null>(null);
  const [questions, setQuestions] = useState<QuestionDoc[]>([]);
  const [loading, setLoading] = useState(true);

  // NEW QUESTION STATES
  const [kind, setKind] = useState<QuestionKind>("mcq");
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [startSec, setStartSec] = useState<number | null>(null);
  const [endSec, setEndSec] = useState<number | null>(null);

  // PLAYER
  const player = useVideoPlayer("" as any, (p) => (p.loop = false));

  // =============================
  // LOAD DATA
  // =============================
  useEffect(() => {
    (async () => {
      try {
        // load listen
        const snap = await getDoc(doc(db, "listens", id));
        if (!snap.exists()) {
          Alert.alert("Không tìm thấy bài nghe");
          router.back();
          return;
        }

        const d = snap.data() as ListenDoc;
        setListen(d);

        if (d.audioUrl) player.replace(d.audioUrl);

        // load questions
        const qSnap = await getDocs(
          query(
            collection(db, "listens", id, "questions"),
            orderBy("createdAt", "asc")
          )
        );

        const list: QuestionDoc[] = [];
        qSnap.forEach((x) => list.push({ id: x.id, ...(x.data() as any) }));
        setQuestions(list);

        setLoading(false);
      } catch (e) {
        console.log(e);
        Alert.alert("Lỗi tải dữ liệu");
        router.back();
      }
    })();
  }, [id]);

  // =============================
  // MARK START / END
  // =============================
  const markStart = () => {
    const t = player.currentTime ?? 0;
    setStartSec(Math.round(t * 100) / 100);
  };

  const markEnd = () => {
    const t = player.currentTime ?? 0;
    setEndSec(Math.round(t * 100) / 100);
  };
const playSegment = (q: QuestionDoc) => {
  if (q.startSec == null) return;

  // Jump to start time
  player.currentTime = q.startSec ?? 0;
  player.play();

  // Auto pause when reaching end
  if (q.endSec != null) {
    const dur = (q.endSec - q.startSec) * 1000;

    setTimeout(() => {
      player.pause();
    }, dur);
  }
};

  // =============================
  // SAVE QUESTION
  // =============================
  const saveQuestion = async () => {
    if (!prompt.trim()) return Alert.alert("Thiếu câu hỏi.");

    if (kind === "listen_segment" && (startSec == null || endSec == null)) {
      return Alert.alert("Bạn chưa set đoạn Start/End.");
    }

    const ref = collection(db, "listens", id, "questions");

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
      await addDoc(ref, payload);
      Alert.alert("Đã thêm câu hỏi!");

      setPrompt("");
      setAnswer("");
      setOptions(["", "", "", ""]);
      setStartSec(null);
      setEndSec(null);
    } catch {
      Alert.alert("Lỗi lưu câu hỏi");
    }
  };

  // =============================
  // DELETE QUESTION
  // =============================
  const deleteQuestion = async (qid: string) => {
    Alert.alert("Xoá câu hỏi?", "Hành động này không thể hoàn tác.", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "listens", id, "questions", qid));
        },
      },
    ]);
  };

  // =============================
  // RENDER
  // =============================
  if (loading || !listen) {
    return (
      <View style={{ marginTop: 60 }}>
        <ActivityIndicator />
      </View>
    );
  }

  const typeList: QuestionKind[] = [
    "mcq",
    "fill",
    "dictation",
    "listen_segment",
  ];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
      {/* BACK */}
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={{ fontSize: 16 }}>⬅ Quay lại</Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 24, fontWeight: "700", marginTop: 10 }}>
        Câu hỏi – {listen.title}
      </Text>

      {/* PLAYER */}
      <VideoView
        player={player}
        style={{
          width: "100%",
          height: 220,
          backgroundColor: "#000",
          borderRadius: 12,
          marginTop: 20,
        }}
        contentFit="contain"
        nativeControls
      />

      {/* MARK START / END */}
      <View style={{ flexDirection: "row", marginTop: 12 }}>
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

      <Text style={{ marginTop: 10, color: "#666" }}>
        Start: {startSec ?? "—"}s • End: {endSec ?? "—"}s
      </Text>

      {/* TYPE SELECTOR */}
      <Text style={{ fontSize: 18, fontWeight: "700", marginTop: 20 }}>
        Loại câu hỏi
      </Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 10 }}>
        {typeList.map((t) => (
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
        ))}
      </View>

      {/* PROMPT */}
      <Text style={{ marginTop: 20, fontSize: 16 }}>Câu hỏi</Text>
      <TextInput
        value={prompt}
        onChangeText={setPrompt}
        placeholder="Nhập câu hỏi…"
        style={{
          backgroundColor: "#f3f4f6",
          padding: 12,
          borderRadius: 8,
          marginTop: 6,
        }}
      />

      {/* OPTIONS */}
      {kind === "mcq" &&
        options.map((op, i) => (
          <TextInput
            key={i}
            value={op}
            onChangeText={(t) => {
              const arr = [...options];
              arr[i] = t;
              setOptions(arr);
            }}
            placeholder={`Option ${i + 1}`}
            style={{
              backgroundColor: "#f3f4f6",
              padding: 12,
              borderRadius: 8,
              marginTop: 6,
            }}
          />
        ))}

      {/* ANSWER */}
      <Text style={{ marginTop: 20, fontSize: 16 }}>Đáp án</Text>
      <TextInput
        value={answer}
        onChangeText={setAnswer}
        placeholder="Nhập đáp án…"
        style={{
          backgroundColor: "#f3f4f6",
          padding: 12,
          borderRadius: 8,
          marginTop: 6,
        }}
      />

      {/* LIST */}
      <Text style={{ marginTop: 30, fontSize: 20, fontWeight: "700" }}>
        Danh sách câu hỏi
      </Text>

      {questions.map((q) => (
        <View
          key={q.id}
          style={{
            marginTop: 16,
            padding: 14,
            backgroundColor: "#f8fafc",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#e2e8f0",
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#1e293b" }}>
            {q.kind.toUpperCase()}
          </Text>

          <Text style={{ marginTop: 6, color: "#334155" }}>{q.prompt}</Text>

          {q.kind === "mcq" &&
            q.options?.map((op, i) => (
              <Text key={i} style={{ marginTop: 4, color: "#475569" }}>
                {String.fromCharCode(65 + i)}. {op}
              </Text>
            ))}

          <Text style={{ marginTop: 6, color: "#0f172a", fontWeight: "600" }}>
            Đáp án: {q.answer}
          </Text>

          {q.kind === "listen_segment" && (
            <TouchableOpacity
              onPress={() => playSegment(q)}
              style={{
                marginTop: 8,
                padding: 10,
                backgroundColor: "#e0f2fe",
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#0369a1" }}>
                🎧 Play segment {q.startSec}s → {q.endSec}s
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => deleteQuestion(q.id)}
            style={{
              marginTop: 10,
              padding: 10,
              backgroundColor: "#fee2e2",
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#b91c1c", textAlign: "center" }}>🗑 Xoá</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* SAVE BUTTON */}
      <TouchableOpacity
        onPress={saveQuestion}
        style={{
          marginTop: 30,
          padding: 16,
          backgroundColor: "#4f46e5",
          borderRadius: 10,
          marginBottom: 50,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontSize: 16 }}>
          Lưu câu hỏi
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
