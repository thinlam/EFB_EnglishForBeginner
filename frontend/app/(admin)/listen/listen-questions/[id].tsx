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

import { ListenQuestionStyles as S } from "@/components/style/admin/listen";
import { VideoView, useVideoPlayer } from "expo-video";
type QuestionKind = "mcq" | "fill" | "dictation" | "listen_segment";

type ListenDoc = {
  title: string;
  audioUrl: string;
  mediaType: string;
  transcript: string;
};

export default function ListenQuestions() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [listen, setListen] = useState<ListenDoc | null>(null);

  const [kind, setKind] = useState<QuestionKind>("mcq");
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);

  const [startSec, setStartSec] = useState<number | null>(null);
  const [endSec, setEndSec] = useState<number | null>(null);

  const player = useVideoPlayer(null, (p) => (p.loop = false));

  // ==========================
  // LOAD DATA
  // ==========================
  // ⚠ ESLint: player & router intentionally excluded 
 
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


  const markStart = () => {
    setStartSec(Number((player.currentTime ?? 0).toFixed(2)));
  };

  const markEnd = () => {
    setEndSec(Number((player.currentTime ?? 0).toFixed(2)));
  };

  const saveQuestion = async () => {
    if (!prompt.trim()) return Alert.alert("Thiếu câu hỏi.");
    if (kind === "listen_segment" && (!startSec || !endSec)) {
      return Alert.alert("Hãy chọn đoạn Start/End.");
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

  if (loading || !listen) {
    return (
      <View style={S.loadingWrap}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView style={S.container} contentContainerStyle={S.content}>
      {/* BACK */}
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={S.backText}>⬅ Quay lại</Text>
      </TouchableOpacity>

      <Text style={S.title}>Câu hỏi – {listen.title}</Text>

      {/* PREVIEW */}
      <Text style={S.sectionTitle}>Audio / Video Preview</Text>

      <VideoView player={player} style={S.video} contentFit="contain" />

      <View style={S.segmentRow}>
        <TouchableOpacity style={S.btnStart} onPress={markStart}>
          <Text style={S.btnText}> Set Start</Text>
        </TouchableOpacity>

        <TouchableOpacity style={S.btnEnd} onPress={markEnd}>
          <Text style={S.btnText}> Set End</Text>
        </TouchableOpacity>
      </View>

      <Text style={S.segmentInfo}>
        Start: {startSec ?? "—"}s • End: {endSec ?? "—"}s
      </Text>

      {/* QUESTION TYPE */}
      <Text style={S.sectionTitle}>Loại câu hỏi</Text>

      <View style={S.kindWrap}>
        {(["mcq", "fill", "dictation", "listen_segment"] as QuestionKind[]).map(
          (t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setKind(t)}
              style={[S.kindBtn, kind === t && S.kindBtnActive]}
            >
              <Text style={[S.kindText, kind === t && S.kindTextActive]}>
                {t}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {/* PROMPT */}
      <Text style={S.label}>Câu hỏi</Text>
      <TextInput
        value={prompt}
        onChangeText={setPrompt}
        placeholder="Nhập câu hỏi…"
        style={S.input}
      />

      {/* MCQ */}
      {kind === "mcq" &&
        options.map((o, i) => (
          <TextInput
            key={i}
            value={o}
            onChangeText={(v) => {
              const arr = [...options];
              arr[i] = v;
              setOptions(arr);
            }}
            placeholder={`Option ${i + 1}`}
            style={S.input}
          />
        ))}

      {/* ANSWER */}
      <Text style={S.label}>Đáp án</Text>
      <TextInput
        value={answer}
        onChangeText={setAnswer}
        placeholder="Nhập đáp án…"
        style={S.input}
      />

      {kind === "listen_segment" && (
        <Text style={S.segmentInfoSmall}>
          Đoạn trích: {startSec ?? "—"}s → {endSec ?? "—"}s
        </Text>
      )}

      <TouchableOpacity style={S.saveBtn} onPress={saveQuestion}>
        <Text style={S.saveText}>Lưu câu hỏi</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
