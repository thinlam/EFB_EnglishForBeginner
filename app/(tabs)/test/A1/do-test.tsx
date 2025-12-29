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

import { testStyles } from "@/components/style/test.styles";
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
    const isReorder = question.type === "reorder";
    const safeValue = Array.isArray(value) ? value : [];

    /* ===== MULTIPLE CHOICE ===== */
    if (!isReorder) {
      return (
        <View style={{ marginBottom: 30 }}>
          <Text style={testStyles.question}>
            {index + 1}. {question.question}
          </Text>

          {question.options.map((opt: string) => {
            const selected = value === opt;

            return (
              <Pressable
                key={opt}
                onPress={() => onSelect(opt)}
                style={[
                  testStyles.option,
                  {
                    borderColor: selected ? "#2563eb" : "#e5e7eb",
                    backgroundColor: selected ? "#eff6ff" : "#ffffff",
                  },
                ]}
              >
                <Text style={testStyles.optionText}>{opt}</Text>
              </Pressable>
            );
          })}
        </View>
      );
    }

    /* ===== REORDER ===== */
    return (
      <View style={{ marginBottom: 34 }}>
        <Text style={testStyles.question}>
          {index + 1}. {question.question}
        </Text>

        {/* ANSWER AREA */}
        <View style={testStyles.reorderBox}>
          {safeValue.length === 0 ? (
            <Text style={{ color: "#6b7280", fontStyle: "italic" }}>
              Build the correct sentence
            </Text>
          ) : (
            safeValue.map((word: string) => (
              <Pressable
                key={word}
                onPress={() =>
                  onSelect(safeValue.filter((w: string) => w !== word))
                }
                style={[
                  testStyles.wordChip,
                  { backgroundColor: "#2563eb" },
                ]}
              >
                <Text style={{ color: "#ffffff", fontSize: 15 }}>
                  {word}
                </Text>
              </Pressable>
            ))
          )}
        </View>

        {/* WORD BANK */}
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {question.options.map((word: string) => {
            const used = safeValue.includes(word);

            return (
              <Pressable
                key={word}
                disabled={used}
                onPress={() => onSelect([...safeValue, word])}
                style={[
                  testStyles.wordChip,
                  {
                    backgroundColor: used ? "#e5e7eb" : "#f1f5f9",
                    borderWidth: 1,
                    borderColor: "#e5e7eb",
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 15,
                    color: used ? "#9ca3af" : "#111827",
                  }}
                >
                  {word}
                </Text>
              </Pressable>
            );
          })}
        </View>
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

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [currentPart]);

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

  const saveAnswer = (id: string, val: any) => {
    setAnswers((prev) => ({ ...prev, [id]: val }));
  };

  const questions =
    currentPart === "listening"
      ? testData?.listening?.questions
      : currentPart === "reading"
      ? testData?.reading?.questions
      : testData?.writing?.questions;

  const submitTest = () => {
    let score = 0;

    const check = (q: any): number => {
      if (q.type === "reorder") {
        const user = answers[q.id] || [];
        const correct = q.answer;
        return user.length === correct.length &&
          user.every((x: any, i: number) => x === correct[i])
          ? q.score
          : 0;
      }
      return answers[q.id] === q.answer ? q.score : 0;
    };

    testData.listening.questions.forEach((q: any) => (score += check(q)));
    testData.reading.questions.forEach((q: any) => (score += check(q)));
    testData.writing.questions.forEach((q: any) => (score += check(q)));

    router.push({
      pathname: "/test/A1/result",
      params: {
        score: String(score),
        pass: score >= testData.meta.passingScore ? "true" : "false",
      },
    });
  };

  if (loading || !testData) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading test...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={testStyles.screen}>
      {/* HEADER */}
      <View style={[testStyles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={testStyles.headerTitle}>
          {currentPart.toUpperCase()}
        </Text>
        <Text style={testStyles.headerSub}>
          Answer all questions carefully
        </Text>

        {currentPart === "listening" && (
          <Pressable
            onPress={playAudio}
            style={{
              marginTop: 14,
              padding: 14,
              borderRadius: 8,
              backgroundColor: isPlaying ? "#dbeafe" : "#eff6ff",
            }}
          >
            <Text style={{ fontSize: 16 }}>
              {isPlaying ? "Playing audio..." : "Play audio"}
            </Text>
          </Pressable>
        )}
      </View>

      {/* QUESTIONS */}
      <FlatList
        key={currentPart}
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
        ListHeaderComponent={() =>
          currentPart === "reading" && testData?.reading?.passage ? (
            <View
              style={{
                marginBottom: 30,
                padding: 16,
                backgroundColor: "#f9fafb",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#e5e7eb",
              }}
            >
              <Text style={testStyles.passage}>
                {testData.reading.passage}
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 120,
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
            style={[
              testStyles.footerBtn,
              { backgroundColor: "#2563eb" },
            ]}
          >
            <Text style={testStyles.footerText}>Next section</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={submitTest}
            style={[
              testStyles.footerBtn,
              { backgroundColor: "#10b981" },
            ]}
          >
            <Text style={testStyles.footerText}>Submit test</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
