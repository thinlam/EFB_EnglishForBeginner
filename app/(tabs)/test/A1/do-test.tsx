import { Audio } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { db } from "@/scripts/firebase";
import { doc, getDoc } from "firebase/firestore";

/* ================= QUESTION ITEM ================= */

type QuestionItemProps = {
  question: any;
  index: number;
  value: any;
  onSelect: (val: any) => void;
};

// eslint-disable-next-line react/display-name
const QuestionItem = React.memo(
  ({ question, index, value, onSelect }: QuestionItemProps) => {
    const isReorder = Array.isArray(value);

    return (
      <View style={{ marginBottom: 25 }}>
        <Text style={{ fontSize: 20, marginBottom: 10 }}>
          {index + 1}. {question.question}
        </Text>

        {question.options.map((opt: any, i: number) => {
          const selected = isReorder ? value?.includes(opt) : value === i;

          return (
            <Pressable
              key={i}
              android_disableSound
              onPress={() => {
                if (isReorder) {
                  const cur = value || [];
                  onSelect(
                    cur.includes(opt)
                      ? cur.filter((x: any) => x !== opt)
                      : [...cur, opt]
                  );
                } else {
                  onSelect(i);
                }
              }}
              style={{
                padding: 15,
                borderRadius: 8,
                borderWidth: 1, // cố định → không nhảy layout
                borderColor: selected ? "#38bdf8" : "#ddd",
                backgroundColor: selected ? "#e0f2fe" : "#fff",
                marginBottom: 10,
              }}
            >
              <Text>{opt}</Text>
            </Pressable>
          );
        })}
      </View>
    );
  }
);

/* ================= MAIN ================= */

export default function DoTestA1() {
  const router = useRouter();
  const { testId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [testData, setTestData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPart, setCurrentPart] = useState<
    "listening" | "reading" | "writing"
  >("listening");

  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const listRef = useRef<FlatList>(null);

  /* ================= LOAD TEST ================= */

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

  /* ================= AUDIO ================= */

  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [sound]);

  const playAudio = async () => {
    try {
      if (Platform.OS === "web") {
        const audio = new window.Audio(testData.listening.audioUrl);
        setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
        return audio.play();
      }

      if (sound) await sound.unloadAsync();

      const { sound: s } = await Audio.Sound.createAsync(
        { uri: testData.listening.audioUrl },
        { shouldPlay: true }
      );

      setSound(s);
      setIsPlaying(true);

      s.setOnPlaybackStatusUpdate((st) => {
        if (st.isLoaded && st.didJustFinish) setIsPlaying(false);
      });
    } catch {
      setIsPlaying(false);
      alert("Không phát được audio");
    }
  };

  /* ================= HELPERS ================= */

  const saveAnswer = (id: string, val: any) => {
    setAnswers((prev) => ({ ...prev, [id]: val }));
  };

  const questions =
    currentPart === "listening"
      ? testData?.listening?.questions
      : currentPart === "reading"
      ? testData?.reading?.questions
      : testData?.writing?.questions;

  /* ================= SUBMIT ================= */

  const submitTest = () => {
    let score = 0;

    const check = (q: any): number => {
      const kind = (q.kind || q.type || "").toLowerCase();

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

    testData.listening.questions.forEach((q: any) => {
      score += check(q);
    });

    testData.reading.questions.forEach((q: any) => {
      score += check(q);
    });

    testData.writing.questions.forEach((q: any) => {
      score += check(q);
    });

    router.push({
      pathname: "/test/A1/result",
      params: {
        score: String(score),
        pass: score >= testData.meta.passingScore ? "true" : "false",
      },
    });
  };

  /* ================= UI ================= */

  if (loading || !testData) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text>Đang tải...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* HEADER */}
      <View
        style={{
          paddingTop: insets.top + 10,
          paddingHorizontal: 20,
          paddingBottom: 10,
        }}
      >
        <Text style={{ fontSize: 28, fontWeight: "bold" }}>
          {currentPart.toUpperCase()}
        </Text>

        {currentPart === "listening" && (
          <Pressable
            onPress={playAudio}
            style={{
              marginTop: 15,
              padding: 14,
              borderRadius: 8,
              backgroundColor: isPlaying ? "#dbeafe" : "#eef",
            }}
          >
            <Text style={{ fontSize: 18 }}>
              {isPlaying ? "🔊 Playing..." : "▶ Play Audio"}
            </Text>
          </Pressable>
        )}
      </View>

      {/* QUESTIONS */}
      <FlatList
        ref={listRef}
        data={questions}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <QuestionItem
            question={item}
            index={index}
            value={answers[item.id]}
            onSelect={(v) => saveAnswer(item.id, v)}
          />
        )}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 120,
        }}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
        showsVerticalScrollIndicator={false}
      />

      {/* FOOTER */}
      <View
        style={{
          position: "absolute",
          bottom: insets.bottom + 10,
          left: 20,
          right: 20,
        }}
      >
        {currentPart !== "writing" ? (
          <Pressable
            onPress={() =>
              setCurrentPart(
                currentPart === "listening" ? "reading" : "writing"
              )
            }
            style={{
              padding: 18,
              backgroundColor: "#0ea5e9",
              borderRadius: 12,
            }}
          >
            <Text
              style={{ color: "#fff", textAlign: "center", fontSize: 20 }}
            >
              Next
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={submitTest}
            style={{
              padding: 18,
              backgroundColor: "#10b981",
              borderRadius: 12,
            }}
          >
            <Text
              style={{ color: "#fff", textAlign: "center", fontSize: 20 }}
            >
              Submit Test
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
