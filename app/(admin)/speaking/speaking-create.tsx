// app/(admin)/speaking/speaking-create.tsx
import { COLORS } from '@/components/style/admin/AdminColors';
import { SpeakingCreateStyles as S } from '@/components/style/admin/speaking/speaking-create-styles';
import { db } from '@/scripts/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    addDoc,
    collection,
    doc,
    getDoc,
    serverTimestamp,
    updateDoc,
} from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
type SpeakingType = 'repeat' | 'qa' | 'dialogue' | 'monologue';
type Topic =
  | 'Work & Office'
  | 'Travel & Transport'
  | 'Daily Life'
  | 'Shopping & Service'
  | 'Education'
  | 'Technology'
  | 'Entertainment'
  | 'Health & Food'
  | 'Business';

const LEVELS: CEFR[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
const TOPICS: Topic[] = [
  'Work & Office',
  'Travel & Transport',
  'Daily Life',
  'Shopping & Service',
  'Education',
  'Technology',
  'Entertainment',
  'Health & Food',
  'Business',
];
const TYPES: SpeakingType[] = ['repeat', 'qa', 'dialogue', 'monologue'];

export default function SpeakingCreate() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const editingId = params?.id ? String(params.id) : undefined;

  const [loading, setLoading] = useState<boolean>(!!editingId);
  const [saving, setSaving] = useState(false);

  // form state
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState<CEFR>('A1');
  const [topic, setTopic] = useState<Topic>('Daily Life');
  const [type, setType] = useState<SpeakingType>('repeat');

  const [bandMin, setBandMin] = useState<string>('4');
  const [bandMax, setBandMax] = useState<string>('6');
  const [tasksCount, setTasksCount] = useState<string>('1');

  const [audioUrl, setAudioUrl] = useState('');
  const [prompt, setPrompt] = useState('');        // câu hỏi / câu cần nói
  const [sampleAnswer, setSampleAnswer] = useState(''); // gợi ý trả lời

  // pickers
  const [levelPicker, setLevelPicker] = useState(false);
  const [topicPicker, setTopicPicker] = useState(false);
  const [typePicker, setTypePicker] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      if (!editingId) return;
      try {
        const snap = await getDoc(doc(db, 'speaking_lessons', editingId));
        if (!snap.exists()) {
          Alert.alert('Không tìm thấy tài liệu');
          router.back();
          return;
        }
        const raw = snap.data() as any;
        setTitle(raw.title ?? '');
        setLevel((raw.level as CEFR) ?? 'A1');
        setTopic((raw.topic as Topic) ?? 'Daily Life');
        setType((raw.type as SpeakingType) ?? 'repeat');

        setBandMin(String(raw.bandMin ?? 4));
        setBandMax(String(raw.bandMax ?? 6));
        setTasksCount(String(raw.tasksCount ?? 1));

        setAudioUrl(raw.audioUrl ?? '');
        setPrompt(raw.prompt ?? '');
        setSampleAnswer(raw.sampleAnswer ?? '');
      } catch (e: any) {
        console.error(e);
        Alert.alert('Lỗi', e?.message ?? 'Không tải được dữ liệu');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [editingId]);

  const canSave = useMemo(() => {
    if (!title.trim()) return false;
    if (!prompt.trim()) return false; // bắt buộc phải có prompt
    const bMin = Number(bandMin);
    const bMax = Number(bandMax);
    if (Number.isNaN(bMin) || Number.isNaN(bMax)) return false;
    if (bMin < 0 || bMax < 0) return false;
    if (bMax && bMin && bMin > bMax) return false;
    const tc = Number(tasksCount);
    if (Number.isNaN(tc) || tc < 0) return false;
    return true;
  }, [title, prompt, bandMin, bandMax, tasksCount]);

  const onSave = async () => {
    if (!canSave || saving) {
      Alert.alert(
        'Thiếu thông tin',
        'Vui lòng kiểm tra lại tiêu đề, prompt và các trường số.'
      );
      return;
    }
    setSaving(true);
    const payload = {
      title: title.trim(),
      level,
      topic,
      type,
      bandMin: Number(bandMin),
      bandMax: Number(bandMax),
      tasksCount: Number(tasksCount),
      audioUrl: audioUrl.trim(),
      prompt: prompt.trim(),
      sampleAnswer: sampleAnswer.trim(),
      updatedAt: serverTimestamp(),
      ...(editingId ? {} : { createdAt: serverTimestamp() }),
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'speaking_lessons', editingId), payload);
      } else {
        await addDoc(collection(db, 'speaking_lessons'), payload);
      }
      Alert.alert(
        'Thành công',
        editingId ? 'Đã cập nhật bài Speaking.' : 'Đã tạo bài Speaking.'
      );
      router.back();
    } catch (e: any) {
      console.error(e);
      Alert.alert('Lỗi', e?.message ?? 'Không thể lưu.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[S.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={S.header}>
        <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
          <Ionicons name="arrow-back-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={S.headerTitle}>
          {editingId ? 'Sửa Speaking' : 'Tạo Speaking'}
        </Text>
        <TouchableOpacity
          onPress={onSave}
          disabled={!canSave || saving || loading}
          style={[
            S.saveBtn,
            { backgroundColor: canSave ? COLORS.create : COLORS.card2 },
          ]}
        >
          <Ionicons
            name="save-outline"
            size={18}
            color={canSave ? COLORS.bg : COLORS.text}
          />
          <Text
            style={[
              S.saveText,
              { color: canSave ? COLORS.bg : COLORS.text },
            ]}
          >
            {saving ? 'Đang lưu…' : 'Lưu'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={S.formWrap}
          keyboardShouldPersistTaps="handled"
        >
          {/* Tiêu đề */}
          <View style={S.formRow}>
            <Text style={S.formLabel}>Tiêu đề</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Nhập tiêu đề bài Speaking"
              placeholderTextColor={COLORS.muted}
              style={S.input}
            />
          </View>

          {/* Level / Topic / Type */}
          <View style={S.formGroupRow}>
            <TouchableOpacity
              style={S.picker}
              onPress={() => setLevelPicker(true)}
            >
              <Text style={S.pickerValue}>Level: {level}</Text>
              <Ionicons name="chevron-down" size={16} color={COLORS.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={S.picker}
              onPress={() => setTopicPicker(true)}
            >
              <Text style={S.pickerValue} numberOfLines={1}>
                Topic: {topic}
              </Text>
              <Ionicons name="chevron-down" size={16} color={COLORS.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={S.picker}
              onPress={() => setTypePicker(true)}
            >
              <Text style={S.pickerValue}>Type: {type}</Text>
              <Ionicons name="chevron-down" size={16} color={COLORS.muted} />
            </TouchableOpacity>
          </View>

          {/* Band / Tasks */}
          <View style={S.formGroupRow}>
            <TextInput
              value={bandMin}
              onChangeText={setBandMin}
              keyboardType="numeric"
              placeholder="Band min (ví dụ 4)"
              style={S.input}
              placeholderTextColor={COLORS.muted}
            />
            <TextInput
              value={bandMax}
              onChangeText={setBandMax}
              keyboardType="numeric"
              placeholder="Band max (ví dụ 6)"
              style={S.input}
              placeholderTextColor={COLORS.muted}
            />
            <TextInput
              value={tasksCount}
              onChangeText={setTasksCount}
              keyboardType="numeric"
              placeholder="Số lượt nói"
              style={S.input}
              placeholderTextColor={COLORS.muted}
            />
          </View>

          {/* Audio mẫu */}
          <View style={S.formRow}>
            <Text style={S.formLabel}>Audio mẫu (URL)</Text>
            <TextInput
              value={audioUrl}
              onChangeText={setAudioUrl}
              placeholder="https://... (tuỳ chọn)"
              style={S.input}
              autoCapitalize="none"
              placeholderTextColor={COLORS.muted}
            />
          </View>

          {/* Prompt */}
          <View style={S.formRow}>
            <Text style={S.formLabel}>Prompt / Câu hỏi / Câu cần nói *</Text>
            <TextInput
              value={prompt}
              onChangeText={setPrompt}
              multiline
              placeholder="Ví dụ: Talk about your daily routine in the morning."
              style={[S.input, S.textarea]}
              placeholderTextColor={COLORS.muted}
            />
          </View>

          {/* Sample answer */}
          <View style={S.formRow}>
            <Text style={S.formLabel}>Sample answer (gợi ý trả lời)</Text>
            <TextInput
              value={sampleAnswer}
              onChangeText={setSampleAnswer}
              multiline
              placeholder="Ví dụ: I usually get up at 6 a.m. First, I brush my teeth..."
              style={[S.input, S.textarea]}
              placeholderTextColor={COLORS.muted}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* LEVEL PICKER */}
      <Modal
        visible={levelPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setLevelPicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setLevelPicker(false)}>
          <View style={S.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={S.modalBox}>
                <View style={S.modalHeader}>
                  <Text style={S.modalTitle}>Chọn Level</Text>
                </View>
                {LEVELS.map((lv) => {
                  const selected = level === lv;
                  return (
                    <TouchableOpacity
                      key={lv}
                      onPress={() => {
                        setLevel(lv);
                        setLevelPicker(false);
                      }}
                      style={S.modalItem}
                      activeOpacity={0.9}
                    >
                      <Text
                        style={[
                          S.modalItemText,
                          { fontWeight: selected ? '700' : '500' },
                        ]}
                      >
                        {lv}
                      </Text>
                      {selected && (
                        <Ionicons
                          name="checkmark"
                          size={18}
                          color={COLORS.create}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* TOPIC PICKER */}
      <Modal
        visible={topicPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setTopicPicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setTopicPicker(false)}>
          <View style={S.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={[S.modalBox, { width: 300 }]}>
                <View style={S.modalHeader}>
                  <Text style={S.modalTitle}>Chọn Topic</Text>
                </View>
                {TOPICS.map((tp) => {
                  const selected = topic === tp;
                  return (
                    <TouchableOpacity
                      key={tp}
                      onPress={() => {
                        setTopic(tp);
                        setTopicPicker(false);
                      }}
                      style={S.modalItem}
                      activeOpacity={0.9}
                    >
                      <Text
                        style={[
                          S.modalItemText,
                          { fontWeight: selected ? '700' : '500' },
                        ]}
                        numberOfLines={1}
                      >
                        {tp}
                      </Text>
                      {selected && (
                        <Ionicons
                          name="checkmark"
                          size={18}
                          color={COLORS.create}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* TYPE PICKER */}
      <Modal
        visible={typePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setTypePicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setTypePicker(false)}>
          <View style={S.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={S.modalBox}>
                <View style={S.modalHeader}>
                  <Text style={S.modalTitle}>Chọn dạng Speaking</Text>
                </View>
                {TYPES.map((tp) => {
                  const selected = type === tp;
                  return (
                    <TouchableOpacity
                      key={tp}
                      onPress={() => {
                        setType(tp);
                        setTypePicker(false);
                      }}
                      style={S.modalItem}
                      activeOpacity={0.9}
                    >
                      <Text
                        style={[
                          S.modalItemText,
                          { fontWeight: selected ? '700' : '500' },
                        ]}
                      >
                        {tp}
                      </Text>
                      {selected && (
                        <Ionicons
                          name="checkmark"
                          size={18}
                          color={COLORS.create}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
