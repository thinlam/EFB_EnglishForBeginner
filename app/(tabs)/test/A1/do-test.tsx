// app/(tabs)/test/A1/do-test.tsx

import { Audio } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { db } from "@/scripts/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function DoTestA1() {
  const router = useRouter();
  const { testId } = useLocalSearchParams();
  const insets = useSafeAreaInsets(); // ⭐ lấy notch + giọt nước

  const [testData, setTestData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPart, setCurrentPart] = useState<"listening" | "reading" | "writing">("listening");
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Cleanup audio
  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [sound]);

  // Load Test
  useEffect(() => {
    const loadTest = async () => {
      try {
        const ref = doc(db, "tests_cefr", "A1", "pools", String(testId));
        const snap = await getDoc(ref);
        if (snap.exists()) setTestData(snap.data());
      } finally {
        setLoading(false);
      }
    };
    loadTest();
  }, [testId]);

  // Loading UI
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
        <Text>Đang tải bài test...</Text>
      </SafeAreaView>
    );
  }

  if (!testData) {
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
        <Text>Lỗi tải test!</Text>
      </SafeAreaView>
    );
  }

  const { listening, reading, writing, meta } = testData;

  // ================= AUDIO =================
  const playAudio = async () => {
    try {
      if (Platform.OS === "web") {
        const audio = new window.Audio(listening.audioUrl);
        return audio.play();
      }

      if (sound) await sound.unloadAsync();

      const { sound: newSound } = await Audio.Sound.createAsync({
        uri: listening.audioUrl,
      });

      setSound(newSound);
      await newSound.playAsync();
    } catch {
      alert("Không phát được audio!");
    }
  };

  const saveAnswer = (qid: string, value: any) =>
    setAnswers((prev) => ({ ...prev, [qid]: value }));

  // ⭐ Wrapper cho UI 3 phần
  const Wrap = ({ children }: any) => (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: insets.top + 20,       // ⭐ nằm dưới tai thỏ iOS
          paddingBottom: insets.bottom + 50, // ⭐ tránh giọt nước Android
        }}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );

  // ================= LISTENING =================
  const renderListening = () => (
    <Wrap>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>
        Listening
      </Text>

      <TouchableOpacity
        style={{
          padding: 15,
          backgroundColor: "#eef",
          borderRadius: 8,
          marginBottom: 20,
        }}
        onPress={playAudio}
      >
        <Text style={{ fontSize: 18 }}>▶ Play Audio</Text>
      </TouchableOpacity>

      {listening.questions.map((q: any, index: number) => (
        <View key={q.id} style={{ marginBottom: 25 }}>
          <Text style={{ fontSize: 20, marginBottom: 10 }}>
            {index + 1}. {q.question}
          </Text>

          {q.options.map((opt: string, i: number) => {
            const selected = answers[q.id] === i;
            return (
              <TouchableOpacity
                key={i}
                onPress={() => saveAnswer(q.id, i)}
                style={{
                  padding: 15,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: selected ? "#38bdf8" : "#ddd",
                  backgroundColor: selected ? "#e0f2fe" : "#fff",
                  marginBottom: 10,
                }}
              >
                <Text>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      <TouchableOpacity
        onPress={() => setCurrentPart("reading")}
        style={{
          padding: 20,
          backgroundColor: "#0ea5e9",
          borderRadius: 12,
          marginTop: 20,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontSize: 20 }}>
          Next → Reading
        </Text>
      </TouchableOpacity>
    </Wrap>
  );

  // ================= READING =================
  const renderReading = () => (
    <Wrap>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>
        Reading
      </Text>

      <Text style={{ fontSize: 18, marginBottom: 20 }}>
        {reading.passage}
      </Text>

      {reading.questions.map((q: any, index: number) => (
        <View key={q.id} style={{ marginBottom: 25 }}>
          <Text style={{ fontSize: 20, marginBottom: 10 }}>
            {index + 1}. {q.question}
          </Text>

          {q.options.map((opt: string, i: number) => {
            const selected = answers[q.id] === i;
            return (
              <TouchableOpacity
                key={i}
                onPress={() => saveAnswer(q.id, i)}
                style={{
                  padding: 15,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: selected ? "#38bdf8" : "#ddd",
                  backgroundColor: selected ? "#e0f2fe" : "#fff",
                  marginBottom: 10,
                }}
              >
                <Text>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      <TouchableOpacity
        onPress={() => setCurrentPart("writing")}
        style={{
          padding: 20,
          backgroundColor: "#0ea5e9",
          borderRadius: 12,
          marginTop: 20,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontSize: 20 }}>
          Next → Writing
        </Text>
      </TouchableOpacity>
    </Wrap>
  );

  // ================= WRITING =================
  const renderWriting = () => (
    <Wrap>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>
        Writing
      </Text>

      {writing.questions.map((q: any, idx: number) => {
        const kind = (q.kind || q.type || "").trim().toLowerCase();

        return (
          <View key={q.id} style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 20, marginBottom: 10 }}>
              {idx + 1}. {q.question}
            </Text>

            {/* Multiple-choice */}
            {["fill_blank", "choose_sentence"].includes(kind) &&
              q.options.map((opt: any, i: number) => {
                const selected = answers[q.id] === i;
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => saveAnswer(q.id, i)}
                    style={{
                      padding: 15,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: selected ? "#38bdf8" : "#ddd",
                      backgroundColor: selected ? "#e0f2fe" : "#fff",
                      marginBottom: 10,
                    }}
                  >
                    <Text>{opt}</Text>
                  </TouchableOpacity>
                );
              })}

            {/* Reorder */}
            {kind === "reorder" &&
              q.options.map((opt: any, i: number) => {
                const arr = answers[q.id] || [];
                const selected = arr.includes(opt);

                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => {
                      let cur = [...arr];
                      cur.includes(opt)
                        ? (cur = cur.filter((x) => x !== opt))
                        : cur.push(opt);
                      saveAnswer(q.id, cur);
                    }}
                    style={{
                      padding: 15,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: selected ? "#38bdf8" : "#ddd",
                      backgroundColor: selected ? "#e0f2fe" : "#fff",
                      marginBottom: 10,
                    }}
                  >
                    <Text>{opt}</Text>
                  </TouchableOpacity>
                );
              })}
          </View>
        );
      })}

      <TouchableOpacity
        onPress={submitTest}
        style={{
          padding: 20,
          backgroundColor: "#10b981",
          borderRadius: 12,
          marginTop: 30,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontSize: 20 }}>
          Submit Test
        </Text>
      </TouchableOpacity>
    </Wrap>
  );

  // ================= SUBMIT =================
  const submitTest = () => {
    let score = 0;

    const check = (q: any) => {
      const kind = (q.kind || q.type || "").trim().toLowerCase();

      if (kind === "reorder") {
        const user = answers[q.id] || [];
        const correct = q.answer;

        if (
          user.length === correct.length &&
          user.every((x: any, i: number) => x === correct[i])
        ) {
          return q.score;
        }
        return 0;
      }

      return answers[q.id] === q.answer ? q.score : 0;
    };

    listening.questions.forEach((q: any) => (score += check(q)));
    reading.questions.forEach((q: any) => (score += check(q)));
    writing.questions.forEach((q: any) => (score += check(q)));

    const pass = score >= meta.passingScore;

    router.push({
      pathname: "/test/A1/result",
      params: {
        score: String(score),
        pass: pass ? "true" : "false",
      },
    });
  };

  return currentPart === "listening"
    ? renderListening()
    : currentPart === "reading"
    ? renderReading()
    : renderWriting();
}
