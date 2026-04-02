// app/(admin)/writing/writing-create.tsx
import { WritingCreateStyles as S } from '@/components/style/admin/writing/writing-create-styles';
import { COLORS } from '@/components/style/colors/AppColors';
import { auth, db, storage } from '@/scripts/firebase';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    addDoc,
    collection,
    doc,
    getDoc,
    serverTimestamp,
    updateDoc,
} from 'firebase/firestore';
import {
    getDownloadURL,
    ref,
    uploadBytes,
} from 'firebase/storage';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
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
type WritingType = 'paragraph' | 'essay' | 'email' | 'report';
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
const TYPES: WritingType[] = ['paragraph', 'essay', 'email', 'report'];

export default function WritingCreate() {
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
  const [type, setType] = useState<WritingType | null>(null);

  const [bandMin, setBandMin] = useState<string>('4');
  const [bandMax, setBandMax] = useState<string>('6');

  const [wordMin, setWordMin] = useState<string>('150');
  const [wordMax, setWordMax] = useState<string>('250');

  const [prompt, setPrompt] = useState('');
  const [sampleAnswer, setSampleAnswer] = useState('');
  const [writingTips, setWritingTips] = useState('');

  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageUploading, setImageUploading] = useState(false);

  // pickers
  const [levelPicker, setLevelPicker] = useState(false);
  const [topicPicker, setTopicPicker] = useState(false);
  const [typePicker, setTypePicker] = useState(false);

  // ===== LOAD DATA WHEN EDITING =====
  useEffect(() => {
    const fetch = async () => {
      if (!editingId) return;
      try {
        const snap = await getDoc(doc(db, 'writing_lessons', editingId));
        if (!snap.exists()) {
          Alert.alert('Không tìm thấy tài liệu');
          router.back();
          return;
        }
        const raw = snap.data() as any;

        setTitle(raw.title ?? '');
        setLevel((raw.level as CEFR) ?? null);
        setTopic((raw.topic as Topic) ?? null);
        setType((raw.type as WritingType) ?? null);

        setBandMin(String(raw.bandMin ?? 4));
        setBandMax(String(raw.bandMax ?? 6));

        setWordMin(String(raw.wordMin ?? 150));
        setWordMax(String(raw.wordMax ?? 250));

        setPrompt(raw.prompt ?? '');
        setSampleAnswer(raw.sampleAnswer ?? '');
        setWritingTips(raw.writingTips ?? '');
        setImageUrl(raw.imageUrl ?? '');
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

    const wMin = Number(wordMin);
    const wMax = Number(wordMax);
    if (Number.isNaN(wMin) || Number.isNaN(wMax)) return false;
    if (wMin <= 0 || wMax <= 0) return false;
    if (wMax && wMin && wMin > wMax) return false;

    return true;
  }, [title, prompt, bandMin, bandMax, wordMin, wordMax, level, topic, type]);

  // ===== LABEL CHO TYPE =====
  const renderTypeLabel = (tp: WritingType | null) => {
    switch (tp) {
      case 'paragraph':
        return 'Paragraph';
      case 'essay':
        return 'Essay';
      case 'email':
        return 'Email / Letter';
      case 'report':
        return 'Report';
      default:
        return 'Select type';
    }
  };

  // ===== UPLOAD IMAGE =====
  const handlePickImage = async () => {
    if (loading || imageUploading) return;

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Thiếu quyền truy cập',
          'Ứng dụng cần quyền truy cập thư viện ảnh để chọn hình.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset?.uri) return;

      const user = auth.currentUser;
      if (!user?.uid) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng.');
        return;
      }

      setImageUploading(true);

      const res = await fetch(asset.uri);
      const blob = await res.blob();

      const extFromName =
        asset.fileName?.split('.').pop()?.toLowerCase() ?? 'jpg';
      const ext = extFromName.match(/(png|jpe?g|webp)/)
        ? extFromName
        : 'jpg';

      const fileId = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}.${ext}`;

      const storageRef = ref(
        storage,
        `writing_images/${user.uid}/${fileId}`
      );

      await uploadBytes(storageRef, blob, {
        contentType: blob.type || `image/${ext === 'jpg' ? 'jpeg' : ext}`,
      });

      const url = await getDownloadURL(storageRef);
      setImageUrl(url);
      Alert.alert('Thành công', 'Đã tải ảnh đề lên Writing.');
    } catch (e: any) {
      console.error(e);
      Alert.alert(
        'Lỗi upload ảnh',
        e?.message ?? 'Không thể tải ảnh, vui lòng thử lại.'
      );
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveImage = () => {
    if (!imageUrl) return;
    Alert.alert('Xoá ảnh', 'Bạn có chắc muốn xoá ảnh đề khỏi bài này?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: () => setImageUrl(''),
      },
    ]);
  };

  // ===== SAVE =====
  const onSave = async () => {
    if (!canSave || saving || imageUploading) {
      Alert.alert(
        'Thiếu thông tin',
        'Vui lòng kiểm tra lại tiêu đề, prompt, band, số từ và đảm bảo ảnh (nếu có) đã upload xong.'
      );
      return;
    }

    setSaving(true);

    const payload = {
      title: title.trim(),
      level: level as CEFR,
      topic: topic as Topic,
      type: type as WritingType,
      bandMin: Number(bandMin),
      bandMax: Number(bandMax),
      wordMin: Number(wordMin),
      wordMax: Number(wordMax),
      prompt: prompt.trim(),
      sampleAnswer: sampleAnswer.trim(),
      writingTips: writingTips.trim(),
      imageUrl: imageUrl.trim(),
      updatedAt: serverTimestamp(),
      ...(editingId ? {} : { createdAt: serverTimestamp() }),
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'writing_lessons', editingId), payload);
      } else {
        await addDoc(collection(db, 'writing_lessons'), payload);
      }
      Alert.alert(
        'Thành công',
        editingId ? 'Đã cập nhật bài Writing.' : 'Đã tạo bài Writing.'
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
              {editingId ? 'Edit Writing Task' : 'Create Writing Task'}
            </Text>
            <Text style={S.headerSubtitle}>
              {editingId
                ? 'Update an existing writing exercise'
                : 'Add a new writing exercise to the system'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={onSave}
          disabled={!canSave || saving || loading || imageUploading}
          style={[
            S.saveBtn,
            {
              opacity:
                !canSave || saving || loading || imageUploading ? 0.6 : 1,
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
          {/* WRITING INFO */}
          <View style={S.sectionCard}>
            <View style={S.sectionHeader}>
              <Text style={S.sectionTitle}>Writing task info</Text>
            </View>

            {/* Title */}
            <View style={S.formRow}>
              <Text style={S.formLabel}>Title (*)</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="E.g., Essay – Advantages of online learning"
                placeholderTextColor={COLORS.muted}
                style={S.input}
                editable={!loading}
              />
            </View>

            {/* Level / Topic / Type */}
            <View style={S.formRow}>
              <Text style={S.formLabel}>Level, Topic & writing type</Text>
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

                {/* Writing type */}
                <TouchableOpacity
                  style={S.picker}
                  onPress={() => !loading && setTypePicker(true)}
                  activeOpacity={0.85}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={S.pickerLabel}>Type</Text>
                    <Text
                      style={[
                        S.pickerValue,
                        !type && S.pickerPlaceholder,
                      ]}
                      numberOfLines={1}
                    >
                      {type ? renderTypeLabel(type) : 'Select type'}
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
            </View>

            <View style={S.formGroupRow}>
              <View style={S.smallField}>
                <Text style={S.formLabel}>Min words</Text>
                <TextInput
                  value={wordMin}
                  onChangeText={setWordMin}
                  keyboardType="numeric"
                  placeholder="150"
                  placeholderTextColor={COLORS.muted}
                  style={S.input}
                  editable={!loading}
                />
              </View>
              <View style={S.smallField}>
                <Text style={S.formLabel}>Max words</Text>
                <TextInput
                  value={wordMax}
                  onChangeText={setWordMax}
                  keyboardType="numeric"
                  placeholder="250"
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
                  name="document-text-outline"
                  size={14}
                  color={COLORS.create}
                />
                <Text style={S.badgeText}>
                  Words: {wordMin || '?'} – {wordMax || '?'}
                </Text>
              </View>
            </View>
          </View>

          {/* CONTENT SECTION */}
          <View style={S.sectionCard}>
            <View style={S.sectionHeader}>
              <Text style={S.sectionTitle}>Writing content</Text>
              <Text style={S.sectionSubtitle}>
                Task image, prompt, sample answer and teacher tips
              </Text>
            </View>

            {/* Task image */}
            <View style={S.formRow}>
              <Text style={S.formLabel}>Task image (optional)</Text>
              {imageUrl ? (
                <>
                  <Image
                    source={{ uri: imageUrl }}
                    style={S.imagePreview}
                    resizeMode="cover"
                  />
                  <View style={S.imageActionsRow}>
                    <TouchableOpacity
                      style={[S.imageBtn, S.imageBtnPrimary]}
                      onPress={handlePickImage}
                      disabled={imageUploading || loading}
                      activeOpacity={0.9}
                    >
                      {imageUploading ? (
                        <ActivityIndicator size="small" color={COLORS.bg} />
                      ) : (
                        <>
                          <Ionicons
                            name="image-outline"
                            size={14}
                            color={COLORS.bg}
                          />
                          <Text style={[S.imageBtnText, S.imageBtnTextPrimary]}>
                            Change image
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={S.imageBtn}
                      onPress={handleRemoveImage}
                      disabled={imageUploading || loading}
                      activeOpacity={0.9}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={14}
                        color={COLORS.text}
                      />
                      <Text style={S.imageBtnText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <View style={S.imageEmptyBox}>
                    <Ionicons
                      name="image-outline"
                      size={22}
                      color={COLORS.textMuted}
                    />
                    <Text style={S.imageEmptyText}>
                      No task image selected.
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[S.imageBtn, S.imageBtnPrimary]}
                    onPress={handlePickImage}
                    disabled={imageUploading || loading}
                    activeOpacity={0.9}
                  >
                    {imageUploading ? (
                      <ActivityIndicator size="small" color={COLORS.bg} />
                    ) : (
                      <>
                        <Ionicons
                          name="cloud-upload-outline"
                          size={14}
                          color={COLORS.bg}
                        />
                        <Text style={[S.imageBtnText, S.imageBtnTextPrimary]}>
                          Upload image
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </>
              )}
              <Text style={S.inlineHelpText}>
                Ảnh đề bài (biểu đồ, infographic...) sẽ hiển thị cùng prompt.
              </Text>
            </View>

            {/* Prompt */}
            <View style={S.formRow}>
              <Text style={S.formLabel}>Prompt / Question *</Text>
              <TextInput
                value={prompt}
                onChangeText={setPrompt}
                multiline
                placeholder="E.g., Some people believe that... To what extent do you agree or disagree?"
                style={[S.input, S.textarea]}
                placeholderTextColor={COLORS.muted}
                editable={!loading}
              />
              <Text style={S.inlineHelpText}>
                Đây là đề bài / yêu cầu viết mà học viên sẽ nhìn thấy.
              </Text>
            </View>

            {/* Sample answer */}
            <View style={S.formRow}>
              <Text style={S.formLabel}>Sample answer (optional)</Text>
              <TextInput
                value={sampleAnswer}
                onChangeText={setSampleAnswer}
                multiline
                placeholder="E.g., In many countries, online learning has become..."
                style={[S.input, S.textarea]}
                placeholderTextColor={COLORS.muted}
                editable={!loading}
              />
              <Text style={S.inlineHelpText}>
                Dùng để lưu band sample / bài mẫu cho giáo viên hoặc hiển thị
                cho học viên.
              </Text>
            </View>

            {/* Writing tips */}
            <View style={S.formRow}>
              <Text style={S.formLabel}>Writing tips (optional)</Text>
              <TextInput
                value={writingTips}
                onChangeText={setWritingTips}
                multiline
                placeholder="E.g., Remind students to cover all parts of the task, use linking words, and avoid very short paragraphs."
                style={[S.input, S.textarea]}
                placeholderTextColor={COLORS.muted}
                editable={!loading}
              />
              <Text style={S.inlineHelpText}>
                Gợi ý cho học viên: cấu trúc, ý chính, lỗi cần tránh, thời gian
                đề nghị,...
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
            <Text style={S.loadingText}>Đang tải dữ liệu bài Writing…</Text>
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
                  <Text style={S.modalTitle}>Select writing type</Text>
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
                        {renderTypeLabel(tp as WritingType)}
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
