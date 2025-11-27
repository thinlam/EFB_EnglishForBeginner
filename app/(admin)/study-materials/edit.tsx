// app/(admin)/study-materials/edit.tsx
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
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

import { db, storage } from '@/scripts/firebase';
import type { CEFR, StudyMaterial, StudyMaterialType } from '@/types/admin/studyMaterial';
import {
    addDoc,
    collection,
    doc,
    getDoc,
    serverTimestamp,
    updateDoc,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

/* ===== Constants ===== */
const LEVEL_OPTIONS: (CEFR | 'ALL')[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'ALL'];
const TYPE_OPTIONS: StudyMaterialType[] = ['pdf', 'word'];

/* ===== Helpers ===== */
function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '')
    .slice(0, 60);
}

type FormState = {
  title: string;
  description: string;
  level: CEFR | 'ALL';
  type: StudyMaterialType;
  url: string;             // URL sau khi upload storage
  tagsText: string;
  originalUrl?: string | null; // dùng khi edit, chưa đổi file
};

type PickedFile = {
  name: string;
  uri: string;
  mimeType: string | null;
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
    url: '',
    tagsText: '',
    originalUrl: undefined,
  });

  const [pickedFile, setPickedFile] = React.useState<PickedFile | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);

  const [loading, setLoading] = React.useState<boolean>(!!id);
  const [saving, setSaving] = React.useState(false);

  /* ===== LOAD DATA WHEN EDIT ===== */
  React.useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        setLoading(true);
        const refDoc = doc(db, 'studyMaterials', id);
        const snap = await getDoc(refDoc);
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
          url: data.url ?? '',
          originalUrl: data.url ?? '',
          tagsText: tagsArr.join(', '),
        });
      } catch (err) {
        console.error('Load studyMaterial error:', err);
        Alert.alert('Lỗi', 'Không tải được dữ liệu tài liệu.');
        router.back();
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  /* ===== HELPERS ===== */
  const handleChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const canSave = React.useMemo(() => {
    const hasUrl = (form.url || form.originalUrl || '').trim().length > 0;
    return form.title.trim().length > 0 && hasUrl;
  }, [form.title, form.url, form.originalUrl]);

  const handleBack = () => {
    router.back();
  };

  /* ===== PICK & UPLOAD FILE TO STORAGE ===== */
  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset) return;

      const pf: PickedFile = {
        name: asset.name ?? 'study-file',
        uri: asset.uri,
        mimeType: asset.mimeType ?? 'application/octet-stream',
      };
      setPickedFile(pf);

      setUploading(true);
      setUploadProgress(0);

      // chuyển file uri -> blob
      const resp = await fetch(pf.uri);
      const blob = await resp.blob();

      const extFromName =
        pf.name.split('.').pop() ||
        (pf.mimeType === 'application/pdf' ? 'pdf' : 'bin');

      const baseSlug = slugify(form.title || pf.name || 'study-file');
      const path = `files/${baseSlug}_${Date.now()}.${extFromName}`;

      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, blob, {
        contentType: pf.mimeType || undefined,
      });

      const downloadUrl: string = await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snap) => {
            if (snap.totalBytes) {
              const pct = Math.round(
                (snap.bytesTransferred / snap.totalBytes) * 100,
              );
              setUploadProgress(pct);
            }
          },
          (error) => reject(error),
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          },
        );
      });

      setForm((prev) => ({
        ...prev,
        url: downloadUrl,
      }));

      Alert.alert('Thành công', 'Đã upload file lên Firebase Storage.');
    } catch (err: any) {
      console.error('Upload file error:', err);
      Alert.alert('Lỗi upload', err?.message || 'Không upload được file.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveFile = () => {
    setPickedFile(null);
    setForm((prev) => ({
      ...prev,
      url: '',
      originalUrl: '',
    }));
  };

  /* ===== SAVE FIRESTORE ===== */
  const handleSave = async () => {
    Keyboard.dismiss();

    if (!canSave) {
      Alert.alert(
        'Thiếu thông tin',
        'Vui lòng nhập tiêu đề và upload file PDF/Word.',
      );
      return;
    }

    try {
      setSaving(true);

      const tagsArr = form.tagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const finalUrl = (form.url || form.originalUrl || '').trim();

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        level: form.level,
        type: form.type,
        url: finalUrl,
        tags: tagsArr,
        updatedAt: serverTimestamp(),
      };

      if (isEdit && id) {
        const refDoc = doc(db, 'studyMaterials', id);
        await updateDoc(refDoc, payload);
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
      console.error('Save studyMaterial error:', err);
      Alert.alert('Lỗi', 'Không lưu được tài liệu. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  /* ===== LOADING ===== */
  const insetsTop = insets.top < 10 ? 10 : insets.top;

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insetsTop }]}>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" />
          <Text style={styles.helperText}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const disabled = saving || uploading || !canSave;

  /* ===== UI ===== */
  const Content = (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: insets.bottom + 24 },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Ionicons name="chevron-back" size={20} color="#E5E7EB" />
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>
            {isEdit ? 'Chỉnh sửa tài liệu' : 'Thêm tài liệu mới'}
          </Text>
          <Text style={styles.headerSub}>
            Upload file PDF / Word lên Firebase Storage (folder `files`)
          </Text>
        </View>
      </View>

      {/* Title */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Tiêu đề *</Text>
        <TextInput
          value={form.title}
          onChangeText={(t) => handleChange('title', t)}
          placeholder="VD: Bài tập Toán lớp 3 – Phép cộng"
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
          placeholder="Mô tả ngắn về nội dung tài liệu"
          placeholderTextColor="#6B7280"
          style={[styles.input, styles.textArea]}
          multiline
        />
      </View>

      {/* Level */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Cấp độ (CEFR)</Text>
        <View style={styles.chipRow}>
          {LEVEL_OPTIONS.map((lv) => {
            const active = form.level === lv;
            return (
              <TouchableOpacity
                key={lv}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() =>
                  setForm((prev) => ({ ...prev, level: lv as CEFR | 'ALL' }))
                }
              >
                <Text style={styles.chipText}>
                  {lv === 'ALL' ? 'All levels' : lv}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Type */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Loại file</Text>
        <View style={styles.chipRow}>
          {TYPE_OPTIONS.map((tp) => {
            const active = form.type === tp;
            return (
              <TouchableOpacity
                key={tp}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setForm((prev) => ({ ...prev, type: tp }))}
              >
                <Text style={styles.chipText}>
                  {tp === 'pdf' ? 'PDF' : 'WORD'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* File upload */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>File PDF / Word *</Text>

        <TouchableOpacity
          style={[
            styles.uploadBtn,
            (uploading || saving) && { opacity: 0.7 },
          ]}
          onPress={handlePickFile}
          disabled={uploading || saving}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#E5E7EB" />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={18} color="#E5E7EB" />
              <Text style={styles.uploadBtnText}>
                {pickedFile ? 'Chọn lại file & upload' : 'Chọn file & upload'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {uploadProgress > 0 && uploading && (
          <Text style={styles.progressText}>
            Đang upload… {uploadProgress}%
          </Text>
        )}

        {pickedFile && (
          <Text style={styles.fileInfo} numberOfLines={1}>
            📎 File đã chọn: {pickedFile.name}
          </Text>
        )}

        {!pickedFile && form.originalUrl && (
          <Text style={styles.fileInfo} numberOfLines={2}>
            📎 Đang dùng file cũ:{'\n'}
            {form.originalUrl}
          </Text>
        )}

        {form.url && form.url !== form.originalUrl && (
          <Text style={styles.fileInfo} numberOfLines={2}>
            ✅ URL mới (Firebase Storage):{'\n'}
            {form.url}
          </Text>
        )}

        {(pickedFile || form.originalUrl) && (
          <TouchableOpacity
            style={styles.removeFileBtn}
            onPress={handleRemoveFile}
          >
            <Text style={styles.removeFileText}>Xoá file</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tags */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Tags (phân tách bằng dấu phẩy)</Text>
        <TextInput
          value={form.tagsText}
          onChangeText={(t) => handleChange('tagsText', t)}
          placeholder="VD: toán lớp 3, phép cộng, bài tập"
          placeholderTextColor="#6B7280"
          style={styles.input}
        />
      </View>

      {/* Save */}
      <TouchableOpacity
        style={[styles.saveBtn, disabled && { opacity: 0.6 }]}
        disabled={disabled}
        onPress={handleSave}
      >
        {saving ? (
          <ActivityIndicator size="small" color="#F9FAFB" />
        ) : (
          <>
            <Ionicons name="save-outline" size={18} color="#F9FAFB" />
            <Text style={styles.saveBtnText}>
              {isEdit ? 'Lưu thay đổi' : 'Thêm tài liệu'}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <SafeAreaView
      style={[styles.container, { paddingTop: insetsTop }]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{ flex: 1 }}>{Content}</View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ===== Styles ===== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helperText: {
    marginTop: 10,
    color: '#9CA3AF',
    fontSize: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
  },
  headerTitleBox: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E5E7EB',
  },
  headerSub: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  formGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    color: '#E5E7EB',
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: '#E5E7EB',
    fontSize: 14,
    backgroundColor: '#020617',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.6)',
  },
  chipActive: {
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
    borderColor: '#4F46E5',
  },
  chipText: {
    fontSize: 12,
    color: '#E5E7EB',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#4F46E5',
  },
  uploadBtnText: {
    fontSize: 13,
    color: '#F9FAFB',
    fontWeight: '600',
  },
  progressText: {
    marginTop: 6,
    fontSize: 12,
    color: '#9CA3AF',
  },
  fileInfo: {
    marginTop: 6,
    fontSize: 12,
    color: '#9CA3AF',
  },
  removeFileBtn: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  removeFileText: {
    fontSize: 12,
    color: '#F97373',
    textDecorationLine: 'underline',
  },
  saveBtn: {
    marginTop: 8,
    borderRadius: 999,
    backgroundColor: '#16A34A',
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveBtnText: {
    color: '#F9FAFB',
    fontSize: 15,
    fontWeight: '600',
  },
});
