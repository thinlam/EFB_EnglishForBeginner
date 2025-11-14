// app/(admin)/ReadingCreate.tsx
import { COLORS } from '@/components/style/admin/AdminColors';
import { ReadingCreateStyles as S } from '@/components/style/admin/reading/reading-create-styles';
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
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
type ReadingType = 'story' | 'news' | 'email' | 'notice' | 'ad' | 'blog' | 'dialogue' | 'instruction';
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
  'Work & Office', 'Travel & Transport', 'Daily Life', 'Shopping & Service',
  'Education', 'Technology', 'Entertainment', 'Health & Food', 'Business'
];
const TYPES: ReadingType[] = [
  'story', 'news', 'email', 'notice', 'ad', 'blog', 'dialogue', 'instruction',
];

function colorForLevel(l?: string) {
  switch (l) {
    case 'A1': return '#22c55e';
    case 'A2': return '#10b981';
    case 'B1': return '#06b6d4';
    case 'B2': return '#60a5fa';
    case 'C1': return '#a78bfa';
    default:   return '#9ca3af';
  }
}

export default function ReadingCreate() {
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
  const [type, setType] = useState<ReadingType>('story');
  const [bandMin, setBandMin] = useState<string>('200');
  const [bandMax, setBandMax] = useState<string>('300');
  const [questionsCount, setQuestionsCount] = useState<string>('5');
  const [sourceUrl, setSourceUrl] = useState('');
  const [passage, setPassage] = useState('');

  // pickers
  const [levelPicker, setLevelPicker] = useState(false);
  const [topicPicker, setTopicPicker] = useState(false);
  const [typePicker, setTypePicker] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      if (!editingId) return;
      try {
        const snap = await getDoc(doc(db, 'readings', editingId));
        if (!snap.exists()) {
          Alert.alert('Không tìm thấy tài liệu');
          router.back();
          return;
        }
        const raw = snap.data() as any;
        setTitle(raw.title ?? '');
        setLevel((raw.level as CEFR) ?? 'A1');
        setTopic((raw.topic as Topic) ?? 'Daily Life');
        setType((raw.type as ReadingType) ?? 'story');
        setBandMin(String(raw.bandMin ?? 200));
        setBandMax(String(raw.bandMax ?? 300));
        setQuestionsCount(String(raw.questionsCount ?? 5));
        setSourceUrl(raw.sourceUrl ?? '');
        setPassage(raw.passage ?? '');
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
    if (!passage.trim()) return false;
    const bMin = Number(bandMin);
    const bMax = Number(bandMax);
    if (Number.isNaN(bMin) || Number.isNaN(bMax)) return false;
    if (bMin < 0 || bMax < 0) return false;
    if (bMax && bMin && bMin > bMax) return false;
    const qc = Number(questionsCount);
    if (Number.isNaN(qc) || qc < 0) return false;
    return true;
  }, [title, passage, bandMin, bandMax, questionsCount]);

  const onSave = async () => {
    if (!canSave || saving) {
      Alert.alert('Thiếu thông tin', 'Vui lòng kiểm tra lại tiêu đề, nội dung và các trường số.');
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
      questionsCount: Number(questionsCount),
      sourceUrl: sourceUrl.trim(),
      passage: passage.trim(),
      updatedAt: serverTimestamp(),
      ...(editingId ? {} : { createdAt: serverTimestamp() }),
    };

    try {
      if (editingId) await updateDoc(doc(db, 'readings', editingId), payload);
      else await addDoc(collection(db, 'readings'), payload);
      Alert.alert('Thành công', editingId ? 'Đã cập nhật bài đọc.' : 'Đã tạo bài đọc.');
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
        <Text style={S.headerTitle}>{editingId ? 'Sửa Reading' : 'Tạo Reading'}</Text>
        <TouchableOpacity
          onPress={onSave}
          disabled={!canSave || saving || loading}
          style={[
            S.saveBtn,
            { backgroundColor: canSave ? COLORS.create : COLORS.card2 },
          ]}
        >
          <Ionicons name="save-outline" size={18} color={canSave ? COLORS.bg : COLORS.text} />
          <Text style={[S.saveText, { color: canSave ? COLORS.bg : COLORS.text }]}>
            {saving ? 'Đang lưu…' : 'Lưu'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={S.formWrap} keyboardShouldPersistTaps="handled">
          {/* Tiêu đề */}
          <View style={S.formRow}>
            <Text style={S.formLabel}>Tiêu đề</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Nhập tiêu đề bài đọc"
              placeholderTextColor={COLORS.muted}
              style={S.input}
            />
          </View>

          {/* Level / Topic / Type */}
          <View style={S.formGroupRow}>
            <TouchableOpacity style={S.picker} onPress={() => setLevelPicker(true)}>
              <Text style={S.pickerValue}>Level: {level}</Text>
              <Ionicons name="chevron-down" size={16} color={COLORS.muted} />
            </TouchableOpacity>
            <TouchableOpacity style={S.picker} onPress={() => setTopicPicker(true)}>
              <Text style={S.pickerValue}>Topic: {topic}</Text>
              <Ionicons name="chevron-down" size={16} color={COLORS.muted} />
            </TouchableOpacity>
            <TouchableOpacity style={S.picker} onPress={() => setTypePicker(true)}>
              <Text style={S.pickerValue}>Type: {type}</Text>
              <Ionicons name="chevron-down" size={16} color={COLORS.muted} />
            </TouchableOpacity>
          </View>

          {/* Band / Questions */}
          <View style={S.formGroupRow}>
            <TextInput
              value={bandMin}
              onChangeText={setBandMin}
              keyboardType="numeric"
              placeholder="Band min"
              style={S.input}
              placeholderTextColor={COLORS.muted}
            />
            <TextInput
              value={bandMax}
              onChangeText={setBandMax}
              keyboardType="numeric"
              placeholder="Band max"
              style={S.input}
              placeholderTextColor={COLORS.muted}
            />
            <TextInput
              value={questionsCount}
              onChangeText={setQuestionsCount}
              keyboardType="numeric"
              placeholder="Số câu hỏi"
              style={S.input}
              placeholderTextColor={COLORS.muted}
            />
          </View>

          <View style={S.formRow}>
            <Text style={S.formLabel}>Nguồn (URL)</Text>
            <TextInput
              value={sourceUrl}
              onChangeText={setSourceUrl}
              placeholder="https://..."
              style={S.input}
              autoCapitalize="none"
              placeholderTextColor={COLORS.muted}
            />
          </View>

          <View style={S.formRow}>
            <Text style={S.formLabel}>Nội dung bài đọc</Text>
            <TextInput
              value={passage}
              onChangeText={setPassage}
              multiline
              placeholder="Nhập nội dung bài đọc..."
              style={[S.input, S.textarea]}
              placeholderTextColor={COLORS.muted}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
