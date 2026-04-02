// app/(tabs)/speaking/item/[id].tsx
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCrossPlatformRecorder } from "@/hooks/tab/useCrossPlatformRecorder";
import { auth, db, storage } from "@/scripts/firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export default function SpeakingItem() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    isRecording,
    seconds,
    startRecording,
    stopRecording,
    lastWebBlob,
    lastMobileUri,
  } = useCrossPlatformRecorder();

  const playRef = useRef<Audio.Sound | null>(null);

  /* ============================================
      PLAY AUDIO (WEB / MOBILE)
  ============================================== */
  async function playAudio() {
    try {
      // WEB
      if (Platform.OS === "web") {
        if (!lastWebBlob.current) return;
        const url = URL.createObjectURL(lastWebBlob.current);
        const audio = new window.Audio(url);
        audio.play();
        return;
      }

      // MOBILE
      if (!lastMobileUri.current) return;

      if (playRef.current) {
        try {
          await playRef.current.stopAsync();
          await playRef.current.unloadAsync();
        } catch {}
      }

      const { sound } = await Audio.Sound.createAsync({
        uri: lastMobileUri.current,
      });

      playRef.current = sound;
      await sound.playAsync();
    } catch (e) {
      console.log("Play error:", e);
    }
  }

  /* ============================================
      LOAD SPEAKING LESSON
  ============================================== */
  useEffect(() => {
    async function load() {
      try {
        const ref = doc(db, "speaking_lessons", id);
        const snap = await getDoc(ref);
        if (snap.exists()) setData({ id: snap.id, ...snap.data() });
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  /* ============================================
      SUBMIT SPEAKING ATTEMPT
      (Upload file → Lưu Firestore)
  ============================================== */
  async function submit() {
    try {
      if (!auth.currentUser) {
        Alert.alert("Bạn cần đăng nhập để nộp bài.");
        return;
      }

      if (!lastWebBlob.current && !lastMobileUri.current) {
        Alert.alert("Bạn chưa ghi âm.");
        return;
      }

      setSubmitting(true);

      const userId = auth.currentUser.uid;
      const lessonId = id;
      const fileId = Date.now().toString();

      let blobFile: Blob;

      // WEB
      if (Platform.OS === "web") {
        blobFile = lastWebBlob.current!;
      }
      // MOBILE
      else {
        const res = await fetch(lastMobileUri.current!);
        blobFile = await res.blob();
      }

      // UPLOAD ĐÚNG THEO RULES STORAGE
      const storageRef = ref(
        storage,
        `speaking_attempts/${userId}/${lessonId}/${fileId}.m4a`
      );

      await uploadBytes(storageRef, blobFile);

      const fileUrl = await getDownloadURL(storageRef);

      // SAVED TO FIRESTORE
      await addDoc(collection(db, "speaking_attempts"), {
        userId,
        lessonId,
        fileUrl,
        durationSec: seconds,
        level: data.level ?? null,
        status: "pending",

        teacherScore: null,
        teacherBand: null,
        teacherComment: null,

        createdAt: serverTimestamp(),
        reviewedAt: null,
      });

      Alert.alert("🎉 Đã nộp bài!", "Giáo viên sẽ chấm trong thời gian sớm nhất.");
      router.back();
    } catch (e) {
      console.log(e);
      Alert.alert("Lỗi", "Không thể nộp bài. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  /* ============================================
      UI LOADING / NOT FOUND
  ============================================== */
  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#f8fafc",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator color="black" size="large" />
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#f8fafc",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#0f172a", fontSize: 18 }}>
          Không tìm thấy bài Speaking.
        </Text>
      </SafeAreaView>
    );
  }

  /* ============================================
      MAIN UI
  ============================================== */
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* BACK BUTTON */}
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#0f172a" />
        </TouchableOpacity>

        {/* TITLE */}
        <Text
          style={{
            color: "#0f172a",
            fontSize: 24,
            marginTop: 20,
            fontWeight: "700",
          }}
        >
          {data.title}
        </Text>

        {/* PROMPT */}
        {data.prompt?.trim() !== "" && (
          <View
            style={{
              marginTop: 20,
              backgroundColor: "white",
              borderRadius: 14,
              padding: 16,
              borderColor: "#e2e8f0",
              borderWidth: 1,
            }}
          >
            <Text
              style={{
                color: "#475569",
                fontSize: 16,
                fontWeight: "700",
                marginBottom: 6,
              }}
            >
              Đề bài
            </Text>
            <Text style={{ color: "#1e293b", fontSize: 16 }}>{data.prompt}</Text>
          </View>
        )}

        {/* SAMPLE */}
        {data.sampleAnswer?.trim() !== "" && (
          <View
            style={{
              marginTop: 16,
              backgroundColor: "white",
              borderRadius: 14,
              padding: 16,
              borderColor: "#e2e8f0",
              borderWidth: 1,
            }}
          >
            <Text
              style={{
                color: "#475569",
                fontSize: 16,
                fontWeight: "700",
                marginBottom: 6,
              }}
            >
              Mẫu tham khảo
            </Text>
            <Text style={{ color: "#1e293b", fontSize: 16 }}>
              {data.sampleAnswer}
            </Text>
          </View>
        )}

        {/* TIMER */}
        <Text style={{ color: "#334155", marginTop: 20, fontSize: 15 }}>
          Thời gian ghi âm: {seconds}s
        </Text>

        {/* RECORD */}
        <TouchableOpacity
          onPress={() => (isRecording ? stopRecording() : startRecording())}
          style={{
            marginTop: 24,
            paddingVertical: 14,
            paddingHorizontal: 30,
            backgroundColor: "#6366f1",
            borderRadius: 999,
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "center",
          }}
        >
          <Ionicons
            name={isRecording ? "stop-circle" : "mic-circle"}
            size={30}
            color="white"
          />
          <Text style={{ color: "white", marginLeft: 10, fontSize: 17 }}>
            {isRecording ? "Dừng lại" : "Bắt đầu nói"}
          </Text>
        </TouchableOpacity>

        {/* PLAY */}
        <TouchableOpacity
          onPress={playAudio}
          style={{
            marginTop: 20,
            paddingVertical: 10,
            paddingHorizontal: 26,
            backgroundColor: "#cbd5e1",
            borderRadius: 999,
            alignSelf: "center",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons name="play" size={20} color="#0f172a" />
          <Text style={{ color: "#0f172a", marginLeft: 8, fontSize: 15 }}>
            Nghe lại
          </Text>
        </TouchableOpacity>

        {/* SUBMIT */}
        <TouchableOpacity
          onPress={submit}
          disabled={submitting}
          style={{
            marginTop: 30,
            backgroundColor: submitting ? "#94a3b8" : "#0ea5e9",
            paddingVertical: 14,
            borderRadius: 999,
            alignItems: "center",
          }}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: "white", fontSize: 17, fontWeight: "700" }}>
              Nộp bài cho giáo viên
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
