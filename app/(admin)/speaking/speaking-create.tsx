// app/(admin)/speaking/speaking-create.tsx
import { SpeakingCreateStyles as S } from '@/components/style/admin/speaking/speaking-create-styles';
import { COLORS } from '@/components/style/colors/AppColors';
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
    ActivityIndicator,
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

  // ===== FORM STATE =====
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState<CEFR | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [type, setType] = useState<SpeakingType | null>(null);

  const [bandMin, setBandMin] = useState<string>('4');
  const [bandMax, setBandMax] = useState<string>('6');
  const [tasksCount, setTasksCount] = useState<string>('1');

  const [audioUrl, setAudioUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [sampleAnswer, setSampleAnswer] = useState('');

  // pickers
  const [levelPicker, setLevelPicker] = useState(false);
  const [topicPicker, setTopicPicker] = useState(false);
  const [typePicker, setTypePicker] = useState(false);

  // ===== LOAD DATA WHEN EDITING =====
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
        setLevel((raw.level as CEFR) ?? null);
        setTopic((raw.topic as Topic) ?? null);
        setType((raw.type as SpeakingType) ?? null);

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
  }, [editingId, router]);

  // ===== VALIDATION =====
  const canSave = useMemo(() => {
    if (!title.trim()) return false;
    if (!prompt.trim()) return false;
    if (!level || !topic || !type) return false;

    const bMin = Number(bandMin);
    const bMax = Number(bandMax);
    if (Number.isNaN(bMin) || Number.isNaN(bMax)) return false;
    if (bMin < 0 || bMax < 0) return false;
    if (bMax && bMin && bMin > bMax) return false;

    const tc = Number(tasksCount);
    if (Number.isNaN(tc) || tc < 0) return false;

    return true;
  }, [title, prompt, bandMin, bandMax, tasksCount, level, topic, type]);

  // ===== LABEL CHO TYPE =====
  const renderTypeLabel = (tp: SpeakingType | null) => {
    switch (tp) {
      case 'repeat':
        return 'Repeat';
      case 'qa':
        return 'Q&A';
      case 'dialogue':
        return 'Dialogue';
      case 'monologue':
        return 'Monologue';
      default:
        return 'Select form';
    }
  };

  // ===== SAVE =====
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
      level: level as CEFR,
      topic: topic as Topic,
      type: type as SpeakingType,
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
      {/* HEADER */}
      <View style={S.header}>
        <View style={S.headerLeft}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={S.backBtn}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <View>
            <Text style={S.headerTitle}>
              {editingId ? 'Edit Speaking Lesson' : 'Create Speaking Lesson'}
            </Text>
            <Text style={S.headerSubtitle}>
              {editingId
                ? 'Update an existing speaking task'
                : 'Add a new speaking task to the system'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={onSave}
          disabled={!canSave || saving || loading}
          style={[
            S.saveBtn,
            {
              opacity: !canSave || saving || loading ? 0.6 : 1,
              backgroundColor: canSave ? COLORS.create : COLORS.card2,
            },
          ]}
          activeOpacity={0.9}
        >
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.bg} />
          ) : (
            <>
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
                Save
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* BODY */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={S.formWrap}
          keyboardShouldPersistTaps="handled"
        >
          {/* SPEAKING INFO */}
          <View style={S.sectionCard}>
            <View style={S.sectionHeader}>
              <Text style={S.sectionTitle}>Speaking lesson info</Text>
            </View>

            {/* Title */}
            <View style={S.formRow}>
              <Text style={S.formLabel}>Title (*)</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="E.g., Daily routine – Morning activities"
                placeholderTextColor={COLORS.muted}
                style={S.input}
                editable={!loading}
              />
            </View>

            {/* Level / Topic / Type */}
            <View style={S.formRow}>
              <Text style={S.formLabel}>Level, Topic & speaking form</Text>
              <View style={S.formGroupRow}>
                {/* Level */}
                <TouchableOpacity
                  style={S.picker}
                  onPress={() => !loading && setLevelPicker(true)}
                  activeOpacity={0.85}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={S.pickerLabel}>Level</Text>
                    <Text
                      style={[
                        S.pickerValue,
                        !level && S.pickerPlaceholder,
                      ]}
                      numberOfLines={1}
                    >
                      {level ?? 'Select level'}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-down"
                    size={16}
                    color={COLORS.muted}
                  />
                </TouchableOpacity>

                {/* Topic */}
                <TouchableOpacity
                  style={S.picker}
                  onPress={() => !loading && setTopicPicker(true)}
                  activeOpacity={0.85}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={S.pickerLabel}>Topic</Text>
                    <Text
                      style={[
                        S.pickerValue,
                        !topic && S.pickerPlaceholder,
                      ]}
                      numberOfLines={1}
                    >
                      {topic ?? 'Select topic'}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-down"
                    size={16}
                    color={COLORS.muted}
                  />
                </TouchableOpacity>

                {/* Speaking form */}
                <TouchableOpacity
                  style={S.picker}
                  onPress={() => !loading && setTypePicker(true)}
                  activeOpacity={0.85}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={S.pickerLabel}>Form</Text>
                    <Text
                      style={[
                        S.pickerValue,
                        !type && S.pickerPlaceholder,
                      ]}
                      numberOfLines={1}
                    >
                      {type ? renderTypeLabel(type) : 'Select form'}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-down"
                    size={16}
                    color={COLORS.muted}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* EVALUATION CONFIG */}
          <View style={S.sectionCard}>
            <View style={S.sectionHeader}>
              <Text style={S.sectionTitle}>Evaluation settings</Text>
            </View>

            <View style={S.formGroupRow}>
              <View style={S.smallField}>
                <Text style={S.formLabel}>Band min</Text>
                <TextInput
                  value={bandMin}
                  onChangeText={setBandMin}
                  keyboardType="numeric"
                  placeholder="4"
                  placeholderTextColor={COLORS.muted}
                  style={S.input}
                  editable={!loading}
                />
              </View>
              <View style={S.smallField}>
                <Text style={S.formLabel}>Band max</Text>
                <TextInput
                  value={bandMax}
                  onChangeText={setBandMax}
                  keyboardType="numeric"
                  placeholder="6"
                  placeholderTextColor={COLORS.muted}
                  style={S.input}
                  editable={!loading}
                />
              </View>
              <View style={S.smallField}>
                <Text style={S.formLabel}>Number of turns</Text>
                <TextInput
                  value={tasksCount}
                  onChangeText={setTasksCount}
                  keyboardType="numeric"
                  placeholder="1"
                  placeholderTextColor={COLORS.muted}
                  style={S.input}
                  editable={!loading}
                />
              </View>
            </View>

            <View style={S.badgeRow}>
              <View style={S.badge}>
                <Ionicons
                  name="analytics-outline"
                  size={14}
                  color={COLORS.create}
                />
                <Text style={S.badgeText}>
                  Band {bandMin || '?'} – {bandMax || '?'}
                </Text>
              </View>
              <View style={S.badge}>
                <Ionicons
                  name="mic-outline"
                  size={14}
                  color={COLORS.create}
                />
                <Text style={S.badgeText}>
                  Turns: {tasksCount || '0'}
                </Text>
              </View>
            </View>
          </View>

          {/* CONTENT SECTION */}
          <View style={S.sectionCard}>
            <View style={S.sectionHeader}>
              <Text style={S.sectionTitle}>Speaking content</Text>
              <Text style={S.sectionSubtitle}>
                Optional audio, prompt and sample answer
              </Text>
            </View>

            {/* Audio URL */}
            <View style={S.formRow}>
              <Text style={S.formLabel}>Audio sample (URL)</Text>
              <TextInput
                value={audioUrl}
                onChangeText={setAudioUrl}
                placeholder="https://... (optional)"
                style={S.input}
                autoCapitalize="none"
                placeholderTextColor={COLORS.muted}
                editable={!loading}
              />
              <Text style={S.inlineHelpText}>
                Can be a link from Firebase Storage, Cloudflare R2 or any CDN.
              </Text>
            </View>

            {/* Prompt */}
            <View style={S.formRow}>
              <Text style={S.formLabel}>Prompt / Question *</Text>
              <TextInput
                value={prompt}
                onChangeText={setPrompt}
                multiline
                placeholder="E.g., Talk about your daily morning routine."
                style={[S.input, S.textarea]}
                placeholderTextColor={COLORS.muted}
                editable={!loading}
              />
              <Text style={S.inlineHelpText}>
                This is the main content learners will see and answer.
              </Text>
            </View>

            {/* Sample answer */}
            <View style={S.formRow}>
              <Text style={S.formLabel}>Sample answer (optional)</Text>
              <TextInput
                value={sampleAnswer}
                onChangeText={setSampleAnswer}
                multiline
                placeholder="E.g., I usually get up at 6 a.m. First, I brush my teeth..."
                style={[S.input, S.textarea]}
                placeholderTextColor={COLORS.muted}
                editable={!loading}
              />
              <Text style={S.inlineHelpText}>
                Use this to show a model answer / band sample for learners.
              </Text>
            </View>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* LOADING OVERLAY */}
      {loading && (
        <View style={S.loadingOverlay}>
          <View style={S.loadingBox}>
            <ActivityIndicator size="small" color={COLORS.create} />
            <Text style={S.loadingText}>Đang tải dữ liệu bài Speaking…</Text>
          </View>
        </View>
      )}

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
                  <Text style={S.modalTitle}>Select level</Text>
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
              <View style={[S.modalBox, { width: 320 }]}>
                <View style={S.modalHeader}>
                  <Text style={S.modalTitle}>Select topic</Text>
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
                  <Text style={S.modalTitle}>Select speaking form</Text>
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
                        {renderTypeLabel(tp as SpeakingType)}
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
