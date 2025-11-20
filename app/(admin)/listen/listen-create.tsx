// app/(admin)/listen-create.tsx
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/* Styles (đã tách) */
import { ListenCreateStyles as CS } from '@/components/style/admin/listen/listen-create-styles';
import { COLORS, ListenStyles as S } from '@/components/style/admin/listen/listen-screen-styles';

/* Firestore */
import { db } from '@/scripts/firebase';
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

/* expo-video */
import { VideoView, useVideoPlayer } from 'expo-video';

/* ================== Cloudinary Config ================== */
const CLOUD_NAME   = 'djf9vnngm';
const CLOUD_PRESET = 'unsigned_mobile';
const CLOUD_FOLDER = 'lessons';

/* ================= Types ================= */
type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
type ExerciseType =
  | 'fill_gaps'
  | 'guess_object'
  | 'phoneme_choice'
  | 'phrase_gaps'
  | 'reading_mcq';

const EXERCISE_BY_LEVEL: Record<CEFR, ExerciseType> = {
  A1: 'fill_gaps',
  A2: 'guess_object',
  B1: 'phoneme_choice',
  B2: 'phrase_gaps',
  C1: 'reading_mcq',
};

type ListenDoc = {
  title: string;
  transcript: string;
  audioUrl?: string;
  mediaType?: string | null;
  level: CEFR;
  exerciseType?: ExerciseType;
  payload?: any;
  isPublished?: boolean;

  // file tài liệu bài tập (Word/PDF/Excel)
  exerciseFileUrl?: string | null;
  exerciseFileName?: string | null;
};

/* ================= Utils ================= */
function slugify(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '').slice(0, 60);
}
function isHlsUrl(u: string) { return (u || '').toLowerCase().endsWith('.m3u8'); }
function isCloudinaryVideoUrl(u: string) {
  const lower = (u || '').toLowerCase();
  return lower.includes('res.cloudinary.com') && lower.includes('/video/upload/');
}
function isVideoUrl(u: string) {
  const l = (u || '').toLowerCase();
  return (
    l.endsWith('.mp4') ||
    l.endsWith('.m4v') ||
    l.endsWith('.mov') ||
    isHlsUrl(l) ||
    isCloudinaryVideoUrl(l)
  );
}
function inferMediaTypeFromUrl(u: string): string {
  const lower = (u || '').toLowerCase();
  if (isHlsUrl(lower)) return 'application/x-mpegURL';
  if (lower.endsWith('.wav')) return 'audio/wav';
  if (lower.endsWith('.m4a')) return 'audio/x-m4a';
  if (lower.endsWith('.mp3') || lower.endsWith('.mpeg')) return 'audio/mpeg';
  if (isVideoUrl(lower)) return 'video/mp4';
  return 'audio/mpeg';
}
function getExt(uriOrName: string, fallback = 'mp3') {
  const clean = (uriOrName || '').split('?')[0];
  const ext = (clean.split('.').pop() || fallback).toLowerCase();
  return ext;
}
function isAudioExt(ext: string) {
  return ['mp3', 'mpeg', 'm4a', 'wav'].includes(ext);
}
function guessAudioMime(ext: string) {
  if (ext === 'wav') return 'audio/wav';
  if (ext === 'm4a') return 'audio/x-m4a';
  return 'audio/mpeg';
}
function guessVideoMime(ext: string) {
  if (ext === 'mov') return 'video/quicktime';
  if (ext === 'm4v') return 'video/x-m4v';
  if (ext === 'webm') return 'video/webm';
  return 'video/mp4';
}

/* ================= Cloudinary upload (audio/video) ================= */
async function uploadMediaToCloudinary(
  localUri: string,
  folder: string,
  baseName?: string,
  onProgress?: (pct: number) => void,
  opts?: { forceAudioMp3?: boolean; videoDelivery?: 'mp4' | 'hls' }
): Promise<{ secure_url: string; public_id: string; deliveryUrl: string; mediaType: string; isAudio: boolean }> {
  const ext = getExt(localUri);
  const isAudio = isAudioExt(ext);
  const mime = isAudio ? guessAudioMime(ext) : guessVideoMime(ext);
  const fileName = `${baseName || (isAudio ? 'aud' : 'vid')}_${Date.now()}.${ext}`;

  const form = new FormData();
  form.append('file', { uri: localUri, name: fileName, type: mime } as any);
  form.append('upload_preset', CLOUD_PRESET);
  form.append('folder', `${CLOUD_FOLDER}/${folder}`);

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`;

  const res = await new Promise<{ status: number; text: string }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (onProgress && e.lengthComputable) {
        onProgress(Math.round((e.loaded / Math.max(e.total, 1)) * 100));
      }
    };
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) resolve({ status: xhr.status, text: xhr.responseText });
    };
    xhr.onerror = (err) => reject(err);
    xhr.open('POST', url);
    xhr.send(form);
  });

  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Cloudinary upload failed (${res.status}): ${res.text}`);
  }

  const json = JSON.parse(res.text);
  const public_id: string = json.public_id;
  const secure_url: string = json.secure_url;

  const forceAudioMp3 = opts?.forceAudioMp3 ?? true;
  const videoDelivery = opts?.videoDelivery ?? 'mp4';

  let deliveryUrl = secure_url;
  let mediaType = mime;

  if (isAudio) {
    if (forceAudioMp3) {
      deliveryUrl = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/f_mp3,q_auto:good/${public_id}.mp3`;
      mediaType = 'audio/mpeg';
    }
  } else {
    if (videoDelivery === 'hls') {
      deliveryUrl = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/sp_auto,q_auto:good/${public_id}.m3u8`;
      mediaType = 'application/x-mpegURL';
    } else {
      deliveryUrl = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/f_mp4,q_auto:good/${public_id}.mp4`;
      mediaType = 'video/mp4';
    }
  }

  return { secure_url, public_id, deliveryUrl, mediaType, isAudio };
}

/* ================= Upload raw file (Word / Excel / PDF) ================= */
async function uploadRawFileToCloudinary(
  localUri: string,
  folder: string,
  baseName?: string,
  onProgress?: (pct: number) => void,
): Promise<{ secure_url: string; public_id: string }> {
  const fileName = `${baseName || 'file'}_${Date.now()}`;

  const form = new FormData();
  form.append('file', {
    uri: localUri,
    name: fileName,
    type: 'application/octet-stream',
  } as any);
  form.append('upload_preset', CLOUD_PRESET);
  form.append('folder', `${CLOUD_FOLDER}/${folder}`);

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`;

  const res = await new Promise<{ status: number; text: string }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (onProgress && e.lengthComputable) {
        onProgress(Math.round((e.loaded / Math.max(e.total, 1)) * 100));
      }
    };
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) resolve({ status: xhr.status, text: xhr.responseText });
    };
    xhr.onerror = (err) => reject(err);
    xhr.open('POST', url);
    xhr.send(form);
  });

  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Cloudinary upload failed (${res.status}): ${res.text}`);
  }

  const json = JSON.parse(res.text);
  return {
    secure_url: json.secure_url as string,
    public_id: json.public_id as string,
  };
}

/* ================= Level Picker ================= */
const LEVELS: CEFR[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

function LevelPickerRow({ value, onChange }: { value: CEFR; onChange: (v: CEFR) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={[S.filterPicker, CS.levelPickerTrigger]}
        onPress={() => setOpen(true)}
        activeOpacity={0.85}>
        <Text style={S.filterValueText}>{value}</Text>
        <Ionicons name="chevron-down" size={16} color={COLORS.muted} style={S.filterChevron} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity
          style={CS.levelModalOverlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={CS.levelModalContainer}>
            <View style={CS.levelModalHeader}>
              <Text style={CS.levelModalTitle}>Chọn cấp độ</Text>
            </View>

            {LEVELS.map((lv) => (
              <TouchableOpacity
                key={lv}
                style={CS.levelOptionRow}
                activeOpacity={0.9}
                onPress={() => {
                  onChange(lv);
                  setOpen(false);
                }}>
                <Text
                  style={[
                    CS.levelOptionText,
                    value === lv && CS.levelOptionTextActive,
                  ]}>
                  {lv}
                </Text>
                {value === lv && (
                  <Ionicons name="checkmark" size={18} color={COLORS.create} />
                )}
              </TouchableOpacity>
            ))}

            <View style={CS.levelModalFooter}>
              <TouchableOpacity
                onPress={() => setOpen(false)}
                style={CS.levelModalCloseBtn}>
                <Text style={CS.levelModalCloseText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

/* ================= Media Preview ================= */
function MediaPreview({ uri, mediaType }: { uri: string; mediaType?: string | null }) {
  if (!uri) return null;

  const isVideoMedia =
    (mediaType || '').startsWith('video/') ||
    mediaType === 'application/x-mpegURL' ||
    isVideoUrl(uri);

  const player = useVideoPlayer(undefined, (p) => {
    p.loop = false;
  });

  useEffect(() => {
    player.replace(uri);
  }, [uri, player]);

  return (
    <View style={CS.mediaPreviewWrapper}>
      <View style={CS.mediaPreviewCard}>
        <Text style={CS.mediaPreviewTitle}>
          Preview {isVideoMedia ? 'Video' : 'Audio'}
        </Text>
        <View
          style={[
            CS.mediaPreviewPlayerBase,
            isVideoMedia ? CS.mediaPreviewPlayerVideo : CS.mediaPreviewPlayerAudio,
          ]}>
          <VideoView
            player={player}
            style={CS.mediaPreviewVideoView}
            allowsFullscreen
            allowsPictureInPicture
            contentFit="contain"
          />
        </View>
      </View>
    </View>
  );
}

/* ================= Screen ================= */
export default function ListenCreateScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const editId = (params?.id as string) || '';

  const [loadingDoc, setLoadingDoc] = useState<boolean>(!!editId);
  const [title, setTitle] = useState('');
  const [transcript, setTranscript] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [level, setLevel] = useState<CEFR>('A1');
  const [exerciseType, setExerciseType] = useState<ExerciseType>(EXERCISE_BY_LEVEL['A1']);
  const [payloadText, setPayloadText] = useState('');

  const [picked, setPicked] = useState<{ name: string; uri: string; file?: any; mimeType?: string | null } | null>(null);

  // file tài liệu bài tập (Word/PDF/Excel)
  const [exerciseFile, setExerciseFile] =
    useState<{ name: string; uri: string } | null>(null);
  const [originalExerciseFile, setOriginalExerciseFile] =
    useState<{ url?: string | null; name?: string | null }>({});

  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [original, setOriginal] = useState<{ audioUrl?: string; mediaType?: string | null }>({});

  const onChangeLevel = (v: CEFR) => {
    setLevel(v);
    const t = EXERCISE_BY_LEVEL[v];
    setExerciseType(t);
    // chỉ đổi level -> exerciseType; nội dung bài tập nằm ở payloadText
  };

  /* Load doc khi edit */
  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!editId) return;
      try {
        setLoadingDoc(true);
        const snap = await getDoc(doc(db, 'listens', editId));
        if (snap.exists() && mounted) {
          const d = snap.data() as ListenDoc;
          const exType = d.exerciseType ?? EXERCISE_BY_LEVEL['A1'];

          setTitle(d.title || '');
          setTranscript(d.transcript || '');
          setLevel(d.level || 'A1');
          setExerciseType(exType);
          setPayloadText(d.payload ? JSON.stringify(d.payload, null, 2) : '');
          setUrlInput(d.audioUrl || '');
          setOriginal({ audioUrl: d.audioUrl, mediaType: d.mediaType ?? null });
          setOriginalExerciseFile({
            url: d.exerciseFileUrl ?? null,
            name: d.exerciseFileName ?? null,
          });
        } else {
          router.back();
        }
      } catch (e: any) {
        Alert.alert('Lỗi', e?.message ?? 'Không tải được dữ liệu.');
      } finally {
        if (mounted) setLoadingDoc(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [editId, router]);

  /* Chọn media file (audio/video) */
  const pickMedia = async () => {
    const r = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
      type: [
        'video/mp4', 'video/quicktime', 'video/x-m4v', 'video/webm',
        'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-m4a',
      ],
    });
    if (r.canceled) return;

    const f = r.assets?.[0];
    if (f?.uri) {
      setPicked({
        name: f.name ?? 'media',
        uri: f.uri,
        file: (f as any)?.file ?? null,
        mimeType: (f as any)?.mimeType ?? null,
      });
    }
  };

  /* Chọn file Word / Excel / PDF */
  const pickExerciseFile = async () => {
    const r = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
      type: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ],
    });
    if (r.canceled) return;

    const f = r.assets?.[0];
    if (f?.uri) {
      setExerciseFile({
        name: f.name ?? 'exercise-file',
        uri: f.uri,
      });
    }
  };

  const onSave = async () => {
    Keyboard.dismiss();

    if (!title.trim()) {
      return Alert.alert('Thiếu Title', 'Vui lòng nhập Title.');
    }
    if (!picked?.uri && !urlInput.trim() && !original.audioUrl) {
      return Alert.alert('Thiếu nội dung', 'Vui lòng chọn file hoặc nhập URL media.');
    }

    setBusy(true);
    setProgress(0);

    // Parse payload JSON (admin / giáo viên tự nhập)
    let parsedPayload: any = {};
    try {
      parsedPayload = payloadText.trim() ? JSON.parse(payloadText) : {};
    } catch (e) {
      Alert.alert(
        'Payload không hợp lệ',
        'Vui lòng kiểm tra lại cú pháp JSON (dấu ngoặc, dấu phẩy, dấu ngoặc kép...).'
      );
      setBusy(false);
      return;
    }

    // Validate tối thiểu theo loại bài (tuỳ bạn có thể nới lỏng)
    try {
      switch (exerciseType) {
        case 'fill_gaps':
          if (!(parsedPayload.sentence && parsedPayload.answer)) {
            throw new Error('Bài A1 (fill_gaps) thường cần có "sentence" và "answer".');
          }
          break;
        case 'guess_object':
          if (!(Array.isArray(parsedPayload.options) && Number.isInteger(parsedPayload.correctIndex))) {
            throw new Error('Bài A2 (guess_object) cần "options" (mảng) và "correctIndex".');
          }
          break;
        case 'phoneme_choice':
          if (!(parsedPayload.word && Array.isArray(parsedPayload.ipaOptions))) {
            throw new Error('Bài B1 (phoneme_choice) cần "word" và "ipaOptions" (mảng).');
          }
          break;
        case 'phrase_gaps':
          if (!(parsedPayload.paragraph && Array.isArray(parsedPayload.gaps))) {
            throw new Error('Bài B2 (phrase_gaps) cần "paragraph" và "gaps" (mảng).');
          }
          break;
        case 'reading_mcq':
          if (!(parsedPayload.passage && Array.isArray(parsedPayload.questions))) {
            throw new Error('Bài C1 (reading_mcq) cần "passage" và "questions" (mảng).');
          }
          break;
      }
    } catch (e: any) {
      Alert.alert('Thiếu dữ liệu', e.message);
      setBusy(false);
      return;
    }

    try {
      // 1) Xử lý media audio/video
      let finalUrl = urlInput.trim() || original.audioUrl || '';
      let mediaType = original.mediaType ?? null;

      if (picked?.uri) {
        const { deliveryUrl, mediaType: mt } = await uploadMediaToCloudinary(
          picked.uri,
          'units',
          slugify(title),
          (pct) => setProgress(pct),
          { forceAudioMp3: true, videoDelivery: 'mp4' }
        );
        finalUrl = deliveryUrl;
        mediaType = mt;
      }

      if (!mediaType && finalUrl) {
        mediaType = inferMediaTypeFromUrl(finalUrl);
      }

      // 2) Xử lý file tài liệu bài tập
      let exerciseFileUrl = originalExerciseFile.url || null;
      let exerciseFileName = originalExerciseFile.name || null;

      // Nếu user chọn "bỏ file cũ"
      if (!exerciseFile && !originalExerciseFile.url) {
        exerciseFileUrl = null;
        exerciseFileName = null;
      }

      // Nếu chọn file mới
      if (exerciseFile?.uri) {
        const { secure_url } = await uploadRawFileToCloudinary(
          exerciseFile.uri,
          'exercise_files',
          slugify(title),
          (pct) => setProgress(pct),
        );
        exerciseFileUrl = secure_url;
        exerciseFileName = exerciseFile.name;
      }

      const basePayload = {
        title: title.trim(),
        transcript: transcript.trim(),
        audioUrl: finalUrl || null,
        mediaType,
        level,
        exerciseType,
        payload: parsedPayload,
        exerciseFileUrl,
        exerciseFileName,
        updatedAt: serverTimestamp(),
      };

      if (editId) {
        // Không đụng isPublished khi sửa: list-screen chịu trách nhiệm bật/tắt
        await updateDoc(doc(db, 'listens', editId), basePayload);
      } else {
        // Bài mới tạo luôn Unpublished, admin bật ở list-screen
        await addDoc(collection(db, 'listens'), {
          ...basePayload,
          isPublished: false,
          createdAt: serverTimestamp(),
        });
      }

      router.replace('/(admin)/listen/listen-screen');
    } catch (e: any) {
      Alert.alert('Lỗi', e?.message ?? 'Không thể lưu bài nghe.');
    } finally {
      setBusy(false);
      setProgress(0);
    }
  };

  /* ---------- UI ---------- */
  const effectiveUrl = (urlInput || original.audioUrl || '').trim();
  const effectiveMediaType =
    (picked?.name
      ? (isAudioExt(getExt(picked.name))
          ? guessAudioMime(getExt(picked.name))
          : guessVideoMime(getExt(picked.name)))
      : (original.mediaType ?? null)) ||
    (effectiveUrl ? inferMediaTypeFromUrl(effectiveUrl) : null);

  const saveDisabled =
    busy ||
    !title.trim() ||
    (!picked?.uri && !urlInput.trim() && !original.audioUrl);

  const Form = (
    <>
      <View style={S.header}>
        <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={S.headerTitle}>
          {editId ? 'Sửa bài nghe' : 'Tạo bài nghe'}
        </Text>
        <View style={CS.headerRightPlaceholder} />
      </View>

      {loadingDoc ? (
        <View style={CS.loadingContainer}>
          <ActivityIndicator color={COLORS.create} />
        </View>
      ) : (
        <ScrollView
          style={CS.scroll}
          contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled">
          <View style={CS.screen}>
            {/* SECTION 1: Thông tin bài nghe */}
            <View style={CS.sectionCard}>
              <Text style={CS.sectionTitle}>Thông tin bài nghe</Text>

              {/* Title + Level cùng hàng */}
              <View style={CS.titleLevelRow}>
                <View style={CS.titleColumn}>
                  <Text style={CS.label}>Title</Text>
                  <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Unit 1 - Greetings"
                    placeholderTextColor={COLORS.muted}
                    style={[CS.input, CS.titleInput]}
                  />
                </View>
                <View style={CS.levelColumn}>
                  <Text style={CS.label}>Level</Text>
                  <LevelPickerRow value={level} onChange={onChangeLevel} />
                </View>
              </View>

              {/* Transcript phía dưới */}
              <Text style={CS.label}>Transcript</Text>
              <TextInput
                value={transcript}
                onChangeText={setTranscript}
                placeholder="A: Hello! How are you? ..."
                placeholderTextColor={COLORS.muted}
                multiline
                style={[CS.input, CS.inputMultiline]}
              />
            </View>

            {/* SECTION 2: Bài tập / Payload + file tài liệu */}
            <View style={CS.sectionCard}>
              <Text style={CS.sectionTitle}>Bài tập</Text>

              <Text style={CS.label}>Exercise Type (auto theo Level)</Text>
              <TextInput
                value={exerciseType}
                editable={false}
                style={[CS.input, CS.exerciseTypeInput]}
              />

              <Text style={CS.label}>Payload (JSON cho bài tập)</Text>
              <TextInput
                value={payloadText}
                onChangeText={setPayloadText}
                multiline
                style={[CS.input, CS.inputMultiline, CS.payloadInput]}
                autoCapitalize="none"
                autoCorrect={false}
              />


              {/* Tài liệu kèm theo */}
              <Text style={[CS.label, { marginTop: 12 }]}>
                Tài liệu tham khảo (Word / Excel / PDF)
              </Text>

              <TouchableOpacity
                style={[CS.pickBtn, busy && CS.pickBtnDisabled]}
                activeOpacity={0.85}
                onPress={pickExerciseFile}
                disabled={busy}
              >
                <Text style={CS.pickBtnText}>
                  {exerciseFile ? 'Chọn lại file tài liệu' : 'Chọn file tài liệu'}
                </Text>
              </TouchableOpacity>

              {!!exerciseFile && (
                <View style={CS.fileActionRow}>
                  <Text style={CS.fileName} numberOfLines={1}>
                    📎 {exerciseFile.name}
                  </Text>
                  <TouchableOpacity
                    style={CS.clearBtn}
                    onPress={() => setExerciseFile(null)}
                    activeOpacity={0.8}
                  >
                    <Text style={CS.clearBtnText}>Xóa</Text>
                  </TouchableOpacity>
                </View>
              )}

              {!!originalExerciseFile.url && !exerciseFile && (
                <View style={CS.fileActionRow}>
                  <Text style={CS.fileName} numberOfLines={1}>
                    Đang dùng file cũ: {originalExerciseFile.name || originalExerciseFile.url}
                  </Text>
                  <TouchableOpacity
                    style={CS.clearBtn}
                    onPress={() => setOriginalExerciseFile({})}
                    activeOpacity={0.8}
                  >
                    <Text style={CS.clearBtnText}>Bỏ</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* SECTION 3: Media */}
            <View style={CS.sectionCard}>
              <Text style={CS.sectionTitle}>Media</Text>

              <Text style={CS.label}>URL (mp3/mp4/m3u8)</Text>
              <TextInput
                value={urlInput}
                onChangeText={setUrlInput}
                autoCapitalize="none"
                placeholder="https://…(.mp3 | .mp4 | .m3u8)"
                placeholderTextColor={COLORS.muted}
                style={CS.input}
              />
              {!!original.audioUrl && !urlInput && !picked && (
                <View style={CS.fileActionRow}>
                  <Text style={CS.fileName}>
                    Giữ nguyên URL cũ: {original.audioUrl}
                  </Text>
                  <TouchableOpacity
                    style={CS.clearBtn}
                    onPress={() => setOriginal({})}
                    activeOpacity={0.8}
                  >
                    <Text style={CS.clearBtnText}>Bỏ</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                disabled={busy}
                onPress={pickMedia}
                style={[CS.pickBtn, busy && CS.pickBtnDisabled]}>
                <Text style={CS.pickBtnText}>
                  {picked ? 'Chọn lại file (mp3/mp4)' : 'Chọn file từ máy (mp3/mp4)'}
                </Text>
              </TouchableOpacity>

              {!!picked && (
                <View style={CS.fileActionRow}>
                  <Text style={CS.fileName} numberOfLines={1}>
                    📄 {picked.name}
                  </Text>
                  <TouchableOpacity
                    style={CS.clearBtn}
                    onPress={() => setPicked(null)}
                    activeOpacity={0.8}
                  >
                    <Text style={CS.clearBtnText}>Xóa</Text>
                  </TouchableOpacity>
                </View>
              )}

              {!!effectiveUrl && (
                <MediaPreview uri={effectiveUrl} mediaType={effectiveMediaType} />
              )}

              {busy && (
                <Text style={CS.progressText}>
                  Đang upload… {progress}%
                </Text>
              )}
            </View>

            {/* Save */}
            <TouchableOpacity
              disabled={saveDisabled}
              onPress={onSave}
              style={[
                CS.saveBtn,
                saveDisabled && CS.saveBtnDisabled,
              ]}>
              {busy ? (
                <ActivityIndicator color={COLORS.bg} />
              ) : (
                <Text style={CS.saveBtnText}>
                  {editId ? 'Cập nhật' : 'Lưu'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={[S.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" />
        {Form}
      </View>
    );
  }
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={[S.container, { paddingTop: insets.top }]}>
          <StatusBar barStyle="light-content" />
          {Form}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
