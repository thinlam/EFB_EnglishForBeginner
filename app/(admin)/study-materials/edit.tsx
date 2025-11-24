// app/(admin)/study-materials/edit.tsx
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { db } from '@/scripts/firebase';
import type { CEFR, StudyMaterial, StudyMaterialType } from '@/types/admin/studyMaterial';
import {
    addDoc,
    collection,
    doc,
    getDoc,
    serverTimestamp,
    updateDoc,
} from 'firebase/firestore';

const LEVEL_OPTIONS: (CEFR | 'ALL')[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const TYPE_OPTIONS: StudyMaterialType[] = ['pdf', 'word'];

type FormState = {
  title: string;
  description: string;
  level: CEFR | 'ALL';
  type: StudyMaterialType;
  tagsText: string;
  content: string;
};

export default function StudyMaterialEditScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const [form, setForm] = React.useState<FormState>({
    title: '',
    description: '',
    level: 'A1',
    type: 'pdf',
    tagsText: '',
    content: '',
  });

  const [loading, setLoading] = React.useState<boolean>(!!id);
  const [saving, setSaving] = React.useState(false);

  // ================= LOAD DATA WHEN EDIT =================
  React.useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        setLoading(true);
        const ref = doc(db, 'studyMaterials', id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          Alert.alert('Thông báo', 'Tài liệu không tồn tại.');
          router.back();
          return;
        }
        const data = snap.data() as StudyMaterial;

        const tagsArr: string[] = Array.isArray(data.tags) ? data.tags : [];

        setForm({
          title: data.title ?? '',
          description: data.description ?? '',
          level: (data.level ?? 'A1') as CEFR | 'ALL',
          type: (data.type ?? 'pdf') as StudyMaterialType,
          content: data.content ?? '',
          tagsText: tagsArr.join(', '),
        });
      } catch (err) {
        console.error(err);
        Alert.alert('Lỗi', 'Không tải được dữ liệu.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  const handleChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const canSave = React.useMemo(() => {
    return form.title.trim().length > 0 && form.content.trim().length > 0;
  }, [form.title, form.content]);

  const handleSave = async () => {
    Keyboard.dismiss();

    if (!canSave) {
      Alert.alert(
        'Thiếu thông tin',
        'Vui lòng nhập tiêu đề và nội dung tài liệu.',
      );
      return;
    }

    try {
      setSaving(true);

      const tagsArr = form.tagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        level: form.level,
        type: form.type,
        content: form.content.trim(),
        tags: tagsArr,
        updatedAt: serverTimestamp(),
      };

      if (isEdit && id) {
        await updateDoc(doc(db, 'studyMaterials', id), payload);
      } else {
        await addDoc(collection(db, 'studyMaterials'), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }

      Alert.alert(
        'Thành công',
        isEdit ? 'Đã cập nhật tài liệu.' : 'Đã thêm tài liệu mới.',
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (err) {
      console.error(err);
      Alert.alert('Lỗi', 'Không lưu được tài liệu.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" />
          <Text style={styles.helperText}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const Content = (
    <ScrollView
      style={{ flex: 1 }}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: insets.bottom + 24,
      }}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color="#E5E7EB" />
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>
            {isEdit ? 'Chỉnh sửa tài liệu' : 'Thêm tài liệu mới'}
          </Text>
          <Text style={styles.headerSub}>Nhập toàn bộ tài liệu dạng text</Text>
        </View>
      </View>

      {/* Title */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Tiêu đề *</Text>
        <TextInput
          value={form.title}
          onChangeText={(t) => handleChange('title', t)}
          placeholder="VD: Lý thuyết thì hiện tại đơn"
          placeholderTextColor="#6B7280"
          style={styles.input}
        />
      </View>

      {/* Description */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Mô tả</Text>
        <TextInput
          value={form.description}
          onChangeText={(t) => handleChange('description', t)}
          placeholder="Mô tả ngắn"
          placeholderTextColor="#6B7280"
          style={[styles.input, styles.textArea]}
          multiline
        />
      </View>

      {/* Level */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Cấp độ CEFR</Text>
        <View style={styles.chipRow}>
          {LEVEL_OPTIONS.map((lv) => {
            const active = form.level === lv;
            return (
              <TouchableOpacity
                key={lv}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => handleChange('level', lv)}
              >
                <Text style={styles.chipText}>{lv}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Type */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Loại tài liệu</Text>
        <View style={styles.chipRow}>
          {TYPE_OPTIONS.map((tp) => {
            const active = form.type === tp;
            return (
              <TouchableOpacity
                key={tp}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => handleChange('type', tp)}
              >
                <Text style={styles.chipText}>
                  {tp === 'pdf' ? 'PDF' : 'WORD'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Content */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Nội dung tài liệu *</Text>
        <TextInput
          value={form.content}
          onChangeText={(t) => handleChange('content', t)}
          placeholder="Nhập tài liệu dạng text…"
          placeholderTextColor="#6B7280"
          style={[styles.input, styles.bigInput]}
          multiline
        />
      </View>

      {/* Tags */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Tags</Text>
        <TextInput
          value={form.tagsText}
          onChangeText={(t) => handleChange('tagsText', t)}
          placeholder="ngữ pháp, reading, lớp 3"
          placeholderTextColor="#6B7280"
          style={styles.input}
        />
      </View>

      {/* Save */}
      <TouchableOpacity
        style={[styles.saveBtn, (!form.title || !form.content) && { opacity: 0.5 }]}
        disabled={!canSave}
        onPress={handleSave}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="save-outline" size={18} color="#fff" />
            <Text style={styles.saveText}>
              {isEdit ? 'Lưu thay đổi' : 'Thêm tài liệu'}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>{Content}</View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ========== Styles ========== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  helperText: { color: '#9CA3AF', marginTop: 10 },

  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitleBox: { flex: 1 },
  headerTitle: { fontSize: 20, color: '#fff', fontWeight: '700' },
  headerSub: { fontSize: 12, color: '#9CA3AF' },

  formGroup: { marginBottom: 14 },
  label: { color: '#E5E7EB', marginBottom: 6, fontWeight: '600' },

  input: {
    borderColor: '#475569',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    color: '#fff',
  },
  textArea: { height: 90, textAlignVertical: 'top' },
  bigInput: { minHeight: 250, textAlignVertical: 'top' },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: '#475569',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chipActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  chipText: { color: '#E5E7EB', fontWeight: '500' },

  saveBtn: {
    backgroundColor: '#4F46E5',
    padding: 14,
    borderRadius: 999,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  saveText: { fontWeight: '700', color: '#fff', marginLeft: 6 },
});
