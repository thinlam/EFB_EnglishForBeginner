// app/reading/questions.tsx
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { db } from '@/scripts/firebase';
import {
    collection,
    doc,
    onSnapshot
} from 'firebase/firestore';

type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

type Reading = {
  id: string;
  title: string;
  level?: CEFR;
};

type ReadingQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};

type QuestionState = {
  selectedIndex: number;
  isCorrect: boolean;
};

export default function ReadingQuestionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [reading, setReading] = useState<Reading | null>(null);
  const [loadingReading, setLoadingReading] = useState(true);

  const [questions, setQuestions] = useState<ReadingQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  const [questionStates, setQuestionStates] = useState<
    Record<string, QuestionState>
  >({});

  const bg = '#F8FAFC';
  const androidRipple = {
    color: 'rgba(17,24,39,0.08)',
    borderless: false,
  } as const;

  // Load info bài đọc (chỉ cần title + level)
  useEffect(() => {
    if (!id) return;
    const ref = doc(db, 'readings', id);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setReading(null);
          setLoadingReading(false);
          return;
        }
        const raw = snap.data() as any;
        const data: Reading = {
          id: snap.id,
          title: raw.title ?? '(Không tiêu đề)',
          level: raw.level as CEFR,
        };
        setReading(data);
        setLoadingReading(false);
      },
      (err) => {
        console.error(err);
        setLoadingReading(false);
      },
    );
    return () => unsub();
  }, [id]);

  // Load câu hỏi
  useEffect(() => {
    if (!id) return;
    const qRef = collection(db, 'readings', id, 'questions');
    const unsubQ = onSnapshot(
      qRef,
      (snap) => {
        const list: ReadingQuestion[] = snap.docs.map((d) => {
          const raw = d.data() as any;
          return {
            id: d.id,
            question: raw.question ?? '',
            options: Array.isArray(raw.options) ? raw.options : [],
            correctIndex:
              typeof raw.correctIndex === 'number' ? raw.correctIndex : 0,
            explanation: raw.explanation ?? '',
          };
        });
        setQuestions(list);
        setLoadingQuestions(false);
      },
      (err) => {
        console.error(err);
        setLoadingQuestions(false);
      },
    );
    return () => unsubQ();
  }, [id]);

  const handleSelectOption = (
    questionId: string,
    index: number,
    correctIndex: number,
  ) => {
    setQuestionStates((prev) => ({
      ...prev,
      [questionId]: {
        selectedIndex: index,
        isCorrect: index === correctIndex,
      },
    }));
  };

  if (!id) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text>ID bài đọc không hợp lệ.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      {/* HEADER */}
      <View
        style={{
          paddingTop: Math.max(insets.top, 8),
          paddingHorizontal: 16,
          paddingBottom: 10,
          backgroundColor: bg,
          borderBottomWidth: Platform.OS === 'ios' ? 0 : 1,
          borderBottomColor: '#E5E7EB',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable
            onPress={() => router.back()}
            android_ripple={androidRipple}
            style={({ pressed }) => [
              {
                width: 36,
                height: 36,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fff',
                shadowColor: '#000',
                shadowOpacity: 0.06,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
                elevation: 1,
                opacity: pressed && Platform.OS === 'ios' ? 0.85 : 1,
              },
            ]}
            accessibilityLabel="Quay lại"
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </Pressable>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text
              numberOfLines={1}
              style={{ color: '#111827', fontSize: 16, fontWeight: '800' }}
            >
              Reading Questions
            </Text>
          </View>

          <View style={{ width: 36, height: 36 }} />
        </View>

        {/* Tiêu đề bài đọc nhỏ dưới header */}
        <View style={{ marginTop: 8 }}>
          {loadingReading ? (
            <ActivityIndicator size="small" />
          ) : !reading ? (
            <Text style={{ color: '#6B7280', fontSize: 13 }}>
              Không tìm thấy bài đọc.
            </Text>
          ) : (
            <Text
              numberOfLines={2}
              style={{
                color: '#111827',
                fontSize: 14,
                fontWeight: '600',
              }}
            >
              {reading.title}
              {reading.level && (
                <Text style={{ color: '#6B7280', fontSize: 13 }}>
                  {'  '}• CEFR {reading.level}
                </Text>
              )}
            </Text>
          )}
        </View>
      </View>

      {/* BODY */}
      {loadingQuestions ? (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <ActivityIndicator />
        </View>
      ) : questions.length === 0 ? (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: '#6B7280' }}>
            Bài đọc này chưa có câu hỏi.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: insets.bottom + 24,
            maxWidth: 720,
            width: '100%',
            alignSelf: 'center',
            gap: 12,
          }}
          contentInsetAdjustmentBehavior="automatic"
          scrollIndicatorInsets={{
            top: 4,
            bottom: insets.bottom + 4,
            left: 0,
            right: 0,
          }}
        >
          <View
            style={{
              borderRadius: 16,
              backgroundColor: '#FFFFFF',
              paddingHorizontal: 16,
              paddingVertical: 14,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              shadowColor: '#000',
              shadowOpacity: 0.03,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 3 },
              elevation: 1,
            }}
          >
            {questions.map((q, index) => {
              const state = questionStates[q.id];
              const hasAnswered = !!state;
              const correctIdx = q.correctIndex ?? 0;

              return (
                <View
                  key={q.id}
                  style={{
                    marginBottom: 16,
                    paddingBottom: 12,
                    borderBottomWidth:
                      index === questions.length - 1 ? 0 : 1,
                    borderColor: '#E5E7EB',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '700',
                      color: '#111827',
                      marginBottom: 6,
                    }}
                  >
                    Câu {index + 1}: {q.question}
                  </Text>

                  {q.options?.map((opt, i) => {
                    const selected = state?.selectedIndex === i;
                    const isCorrectChoice = i === correctIdx;

                    let bg = '#F9FAFB';
                    let textColor = '#374151';
                    let border = '#E5E7EB';

                    if (hasAnswered) {
                      if (selected && state?.isCorrect) {
                        bg = '#DCFCE7';
                        textColor = '#166534';
                        border = '#22C55E';
                      } else if (selected && !state?.isCorrect) {
                        bg = '#FEE2E2';
                        textColor = '#B91C1C';
                        border = '#F97373';
                      } else if (!selected && isCorrectChoice) {
                        bg = '#ECFDF3';
                        textColor = '#166534';
                        border = '#BBF7D0';
                      }
                    }

                    return (
                      <TouchableOpacity
                        key={i}
                        activeOpacity={0.8}
                        onPress={() =>
                          handleSelectOption(q.id, i, correctIdx)
                        }
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6,
                          marginBottom: 6,
                          paddingHorizontal: 10,
                          paddingVertical: 8,
                          borderRadius: 8,
                          backgroundColor: bg,
                          borderWidth: 1,
                          borderColor: border,
                        }}
                      >
                        <Ionicons
                          name={
                            selected
                              ? 'radio-button-on-outline'
                              : 'radio-button-off-outline'
                          }
                          size={16}
                          color={textColor}
                        />
                        <Text
                          style={{
                            fontSize: 13,
                            color: textColor,
                            flex: 1,
                          }}
                        >
                          {String.fromCharCode(65 + i)}. {opt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}

                  {hasAnswered && (
                    <View style={{ marginTop: 6 }}>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '600',
                          color: state.isCorrect ? '#16A34A' : '#DC2626',
                          marginBottom: 2,
                        }}
                      >
                        {state.isCorrect
                          ? '✔ Chính xác!'
                          : `✘ Chưa đúng. Đáp án đúng là ${
                              String.fromCharCode(65 + correctIdx)
                            }.`}
                      </Text>

                      {!!q.explanation && (
                        <Text
                          style={{
                            fontSize: 12,
                            color: '#6B7280',
                            fontStyle: 'italic',
                          }}
                        >
                          Giải thích: {q.explanation}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
