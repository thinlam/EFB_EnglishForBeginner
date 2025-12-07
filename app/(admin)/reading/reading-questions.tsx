// app/(admin)/reading/reading-questions.tsx
import { COLORS } from '@/components/style/colors/AppColors';
import { db } from '@/scripts/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ReadingQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};

export default function ReadingQuestionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; title?: string }>();

  const readingId = params.id ? String(params.id) : undefined;
  const readingTitle = params.title || 'Bài đọc';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [questions, setQuestions] = useState<ReadingQuestion[]>([]);

  // form state
  const [qText, setQText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctIndex, setCorrectIndex] = useState<0 | 1 | 2 | 3>(0);
  const [explanation, setExplanation] = useState('');

  const loadQuestions = async () => {
    if (!readingId) return;
    setLoading(true);
    try {
      const qRef = collection(db, 'readings', readingId, 'questions');
      const q = query(qRef, orderBy('createdAt', 'asc'));
      const snap = await getDocs(q);
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
    } catch (e: any) {
      console.error(e);
      Alert.alert('Lỗi', e?.message ?? 'Không tải được danh sách câu hỏi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!readingId) return;
    loadQuestions();
  }, [readingId]);

  const canSave = useMemo(() => {
    if (!qText.trim()) return false;
    const opts = [optA, optB, optC, optD].map((x) => x.trim());
    if (opts.some((o) => !o)) return false;
    if (correctIndex < 0 || correctIndex > 3) return false;
    return true;
  }, [qText, optA, optB, optC, optD, correctIndex]);

  const resetForm = () => {
    setQText('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setCorrectIndex(0);
    setExplanation('');
  };

  const handleAddQuestion = async () => {
    if (!readingId) {
      Alert.alert('Lỗi', 'Thiếu ID bài đọc.');
      return;
    }
    if (!canSave || saving) {
      Alert.alert(
        'Thiếu thông tin',
        'Vui lòng nhập đủ câu hỏi và 4 lựa chọn.'
      );
      return;
    }

    try {
      setSaving(true);
      const options = [optA, optB, optC, optD].map((o) => o.trim());
      const payload = {
        question: qText.trim(),
        options,
        correctIndex,
        explanation: explanation.trim() || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const ref = await addDoc(
        collection(db, 'readings', readingId, 'questions'),
        payload
      );

      // cập nhật local state cho nhanh
      setQuestions((prev) => [
        ...prev,
        {
          id: ref.id,
          question: payload.question,
          options,
          correctIndex,
          explanation: explanation.trim() || '',
        },
      ]);
      resetForm();
    } catch (e: any) {
      console.error(e);
      Alert.alert('Lỗi', e?.message ?? 'Không thể lưu câu hỏi.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (questionId: string) => {
    if (!readingId) return;
    Alert.alert('Xoá câu hỏi', 'Chắc chắn xoá câu hỏi này?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(
              doc(db, 'readings', readingId, 'questions', questionId)
            );
            setQuestions((prev) =>
              prev.filter((q) => q.id !== questionId)
            );
          } catch (e: any) {
            console.error(e);
            Alert.alert('Lỗi', e?.message ?? 'Không xoá được câu hỏi.');
          }
        },
      },
    ]);
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: ReadingQuestion;
    index: number;
  }) => {
    return (
      <View style={styles.qCard}>
        <View style={styles.qHeader}>
          <Text style={styles.qTitle}>
            Câu {index + 1}: {item.question}
          </Text>
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {item.options.map((opt, i) => {
          const isCorrect = i === item.correctIndex;
          return (
            <Text
              key={i}
              style={[
                styles.qOption,
                isCorrect && styles.qOptionCorrect,
              ]}
            >
              {String.fromCharCode(65 + i)}. {opt}
            </Text>
          );
        })}

        {!!item.explanation && (
          <Text style={styles.qExplanation}>
            Giải thích: {item.explanation}
          </Text>
        )}
      </View>
    );
  };

  if (!readingId) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.bg,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: COLORS.text }}>
          Thiếu thông tin bài đọc (id).
        </Text>
        <TouchableOpacity
          style={[styles.backBtn, { marginTop: 12 }]}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back-outline"
            size={18}
            color={COLORS.text}
          />
          <Text style={{ color: COLORS.text, marginLeft: 6 }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back-outline"
            size={22}
            color={COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={2}>
          Câu hỏi – {readingTitle}
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 24,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Danh sách câu hỏi */}
          <Text style={styles.sectionTitle}>Danh sách câu hỏi</Text>

          {loading ? (
            <ActivityIndicator
              style={{ marginVertical: 16 }}
              color={COLORS.create}
            />
          ) : questions.length === 0 ? (
            <Text style={styles.emptyText}>
              Chưa có câu hỏi nào cho bài đọc này.
            </Text>
          ) : (
            <FlatList
              data={questions}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              scrollEnabled={false}
            />
          )}

          {/* Form thêm câu hỏi mới */}
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Thêm câu hỏi mới</Text>

            <TextInput
              value={qText}
              onChangeText={setQText}
              placeholder="Nhập nội dung câu hỏi"
              placeholderTextColor={COLORS.muted}
              style={styles.input}
              multiline
            />

            {[optA, optB, optC, optD].map((val, idx) => {
              const setter =
                idx === 0
                  ? setOptA
                  : idx === 1
                  ? setOptB
                  : idx === 2
                  ? setOptC
                  : setOptD;
              const label = String.fromCharCode(65 + idx);
              const selected = correctIndex === idx;
              return (
                <View key={idx} style={styles.optionRow}>
                  <TouchableOpacity
                    onPress={() =>
                      setCorrectIndex(idx as 0 | 1 | 2 | 3)
                    }
                    style={[
                      styles.radioOuter,
                      selected && styles.radioOuterActive,
                    ]}
                  >
                    {selected && <View style={styles.radioInner} />}
                  </TouchableOpacity>
                  <Text style={styles.optionLabel}>{label}.</Text>
                  <TextInput
                    value={val}
                    onChangeText={setter}
                    placeholder={`Đáp án ${label}`}
                    placeholderTextColor={COLORS.muted}
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  />
                </View>
              );
            })}

            <TextInput
              value={explanation}
              onChangeText={setExplanation}
              placeholder="Giải thích (không bắt buộc)"
              placeholderTextColor={COLORS.muted}
              style={[styles.input, { marginTop: 8 }]}
              multiline
            />

            <TouchableOpacity
              style={[
                styles.saveBtn,
                {
                  backgroundColor: canSave
                    ? COLORS.create
                    : COLORS.card2,
                },
              ]}
              onPress={handleAddQuestion}
              disabled={!canSave || saving}
              activeOpacity={0.85}
            >
              <Text
                style={{
                  color: canSave ? COLORS.bg : COLORS.text,
                  fontWeight: '700',
                }}
              >
                {saving ? 'Đang lưu…' : 'Lưu câu hỏi'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 8,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.subText,
  },
  emptyText: {
    color: COLORS.muted,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  qCard: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.card2,
  },
  qHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  qTitle: {
    flex: 1,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: 8,
  },
  qOption: {
    marginTop: 3,
    color: COLORS.text,
    fontSize: 14,
  },
  qOptionCorrect: {
    fontWeight: '700',
    color: COLORS.create,
  },
  qExplanation: {
    marginTop: 6,
    fontStyle: 'italic',
    color: COLORS.subText,
    fontSize: 13,
  },
  formCard: {
    marginTop: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.card,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.card2,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: COLORS.text,
    fontSize: 14,
    marginBottom: 10,
    textAlignVertical: 'top',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: COLORS.create,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.create,
  },
  optionLabel: {
    width: 18,
    color: COLORS.text,
    fontWeight: '600',
  },
  saveBtn: {
    marginTop: 12,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
