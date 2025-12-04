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

import { db } from "@/scripts/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function DoTestA1() {
  const router = useRouter();
  const { testId } = useLocalSearchParams();

  const [testData, setTestData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [currentPart, setCurrentPart] = useState<
    "listening" | "reading" | "writing"
  >("listening");

  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Cleanup audio
  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [sound]);

  // Load test from Firestore
  useEffect(() => {
    const loadTest = async () => {
      try {
        const ref = doc(db, "tests_cefr", "A1", "pools", String(testId));
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setTestData(snap.data());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadTest();
  }, [testId]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text>Đang tải bài test...</Text>
      </View>
    );
  }

  if (!testData) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text>Lỗi tải test!</Text>
      </View>
    );
  }

  const { listening, reading, writing, meta } = testData;

  // ======================================================
  // Play Audio
  // ======================================================
  const playAudio = async () => {
    try {
      if (Platform.OS === "web") {
        const audio = new window.Audio(listening.audioUrl);
        audio.play().catch(() =>
          alert("Trình duyệt chặn phát audio! Nhấn lại lần nữa nhé.")
        );
        return;
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

  // ======================================================
  // SAVE ANSWER
  // ======================================================
  const saveAnswer = (qid: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [qid]: value,
    }));
  };

  // ======================================================
  // LISTENING UI
  // ======================================================
  const renderListening = () => (
    <ScrollView style={{ padding: 20 }}>
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
    </ScrollView>
  );

  // ======================================================
  // READING UI
  // ======================================================
  const renderReading = () => (
    <ScrollView style={{ padding: 20 }}>
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
    </ScrollView>
  );

  // ======================================================
  // WRITING UI
  // ======================================================
  const renderWriting = () => (
    <ScrollView style={{ padding: 20 }}>
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

            {/* fill_blank + choose_sentence */}
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

            {/* reorder */}
            {kind === "reorder" &&
              q.options.map((opt: any, i: number) => {
                const arr = answers[q.id] || [];
                const selected = arr.includes(opt);

                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => {
                      let cur = [...arr];
                      if (cur.includes(opt)) {
                        cur = cur.filter((x) => x !== opt);
                      } else {
                        cur.push(opt);
                      }
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
    </ScrollView>
  );

  // ======================================================
  // SUBMIT TEST
  // ======================================================
  const submitTest = () => {
    let score = 0;

    const check = (q: any) => {
      const kind = (q.kind || q.type || "").trim().toLowerCase();

      if (kind === "reorder") {
        const user = answers[q.id] || [];
        const correct = q.answer;
        if (user.length === correct.length) {
          if (user.every((x: any, i: number) => x === correct[i])) {
            return q.score;
          }
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

  // ======================================================
  return currentPart === "listening"
    ? renderListening()
    : currentPart === "reading"
    ? renderReading()
    : renderWriting();
}
