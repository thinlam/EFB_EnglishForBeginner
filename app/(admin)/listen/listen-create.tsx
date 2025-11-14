// app/(admin)/listen-create.tsx
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
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

const TEMPLATE_BY_TYPE: Record<ExerciseType, any> = {
  fill_gaps:     { sentence: 'I __ a book.', answer: 'have', choices: ['has', 'have', 'am'] },
  guess_object:  { options: [{ label: 'pen' }, { label: 'book' }, { label: 'phone' }], correctIndex: 1 },
  phoneme_choice:{ word: 'thought', ipaOptions: ['θɔːt', 'tɔːt', 'ðɒt', 'sɔːt'], correctIndex: 0 },
  phrase_gaps:   { paragraph: 'I’m looking __ my keys.', gaps: [{ index: 13, answer: 'for', choices: ['at','for','into'] }] },
  reading_mcq:   { passage: 'Paragraph...', questions: [{ q: 'Main idea?', options: ['A','B','C','D'], correctIndex: 2 }] },
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
  return l.endsWith('.mp4') || l.endsWith('.m4v') || l.endsWith('.mov') || isHlsUrl(l) || isCloudinaryVideoUrl(l);
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

/* ================= Cloudinary upload ================= */
async function uploadMediaToCloudinary(
  localUri: string,
  folder: string,
  baseName?: string,
  onProgress?: (pct: number) => void,
  opts?: { forceAudioMp3?: boolean; videoDelivery?: 'mp4' | 'hls' }
): Promise<{ secure_url: string; public_id: string; deliveryUrl: string; mediaType: string; isAudio: boolean; }> {
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
      if (onProgress && e.lengthComputable)
        onProgress(Math.round((e.loaded / Math.max(e.total, 1)) * 100));
    };
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) resolve({ status: xhr.status, text: xhr.responseText });
    };
    xhr.onerror = (err) => reject(err);
    xhr.open('POST', url);
    xhr.send(form);
  });

  if (res.status < 200 || res.status >= 300)
    throw new Error(`Cloudinary upload failed (${res.status}): ${res.text}`);

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
              <Text style={CS.levelModalTitle}>
                Chọn cấp độ
              </Text>
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
                {value === lv && <Ionicons name="checkmark" size={18} color={COLORS.create} />}
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

  const player = useVideoPlayer(undefined, (p) => { p.loop = false; });
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
  const [payloadTouched, setPayloadTouched] = useState(false);
  const [published, setPublished] = useState<boolean>(true);
  const [picked, setPicked] = useState<{ name: string; uri: string; file?: any; mimeType?: string | null } | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [original, setOriginal] = useState<{ audioUrl?: string; mediaType?: string | null }>({});

  const onChangeLevel = (v: CEFR) => {
    setLevel(v);
    const t = EXERCISE_BY_LEVEL[v];
    setExerciseType(t);
    if (!payloadTouched) setPayloadText(JSON.stringify(TEMPLATE_BY_TYPE[t], null, 2));
  };

  /* Load doc when editing */
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!editId) return;
      try {
        setLoadingDoc(true);
        const snap = await getDoc(doc(db, 'listens', editId));
        if (snap.exists() && mounted) {
          const d = snap.data() as ListenDoc;
          const exType = (d.exerciseType ?? EXERCISE_BY_LEVEL['A1']);
          setTitle(d.title || '');
          setTranscript(d.transcript || '');
          setLevel(d.level || 'A1');
          setExerciseType(exType);
          setPayloadText(JSON.stringify(d.payload ?? TEMPLATE_BY_TYPE[exType], null, 2));
          setUrlInput(d.audioUrl || '');
          setOriginal({ audioUrl: d.audioUrl, mediaType: d.mediaType ?? null });
          setPublished(d.isPublished ?? true);
        } else {
          router.back();
        }
      } catch (e: any) {
        Alert.alert('Lỗi', e?.message ?? 'Không tải được dữ liệu.');
      } finally {
        if (mounted) setLoadingDoc(false);
      }
    })();
    return () => { mounted = false; };
  }, [editId, router]);

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

  const onSave = async () => {
    Keyboard.dismiss();
    if (!title.trim()) return Alert.alert('Thiếu tiêu đề', 'Vui lòng nhập tiêu đề.');
    if (!picked?.uri && !urlInput.trim() && !original.audioUrl)
      return Alert.alert('Thiếu nội dung', 'Chọn file hoặc nhập URL.');

    setBusy(true);
    setProgress(0);

    // Parse payload JSON
    let parsedPayload: any = {};
    try { parsedPayload = payloadText.trim() ? JSON.parse(payloadText) : {}; }
    catch { Alert.alert('Payload không hợp lệ'); setBusy(false); return; }

    try {
      switch (exerciseType) {
        case 'fill_gaps':
          if (!(parsedPayload.sentence && parsedPayload.answer)) throw new Error('A1 cần "sentence" & "answer".');
          break;
        case 'guess_object':
          if (!(Array.isArray(parsedPayload.options) && Number.isInteger(parsedPayload.correctIndex))) throw new Error('A2 cần "options" & "correctIndex".');
          break;
        case 'phoneme_choice':
          if (!(parsedPayload.word && Array.isArray(parsedPayload.ipaOptions))) throw new Error('B1 cần "word" & "ipaOptions".');
          break;
        case 'phrase_gaps':
          if (!(parsedPayload.paragraph && Array.isArray(parsedPayload.gaps))) throw new Error('B2 cần "paragraph" & "gaps".');
          break;
        case 'reading_mcq':
          if (!(parsedPayload.passage && Array.isArray(parsedPayload.questions))) throw new Error('C1 cần "passage" & "questions".');
          break;
      }
    } catch (e: any) {
      Alert.alert('Thiếu dữ liệu', e.message);
      setBusy(false);
      return;
    }

    try {
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

      if (!mediaType && finalUrl) mediaType = inferMediaTypeFromUrl(finalUrl);

      const payloadWrite = {
        title: title.trim(),
        transcript: transcript.trim(),
        audioUrl: finalUrl || null,
        mediaType,
        level,
        exerciseType,
        payload: parsedPayload,
        isPublished: published,
        updatedAt: serverTimestamp(),
      };

      if (editId)
        await updateDoc(doc(db, 'listens', editId), payloadWrite);
      else
        await addDoc(collection(db, 'listens'), { ...payloadWrite, createdAt: serverTimestamp() });

      router.replace('/(admin)/listen/listen-screen');
    } catch (e: any) {
      Alert.alert('Lỗi', e?.message ?? 'Không thể lưu');
    } finally {
      setBusy(false);
      setProgress(0);
    }
  };

  /* ---------- UI ---------- */
  const effectiveUrl = (urlInput || original.audioUrl || '').trim();
  const effectiveMediaType =
    (picked?.name
      ? (isAudioExt(getExt(picked.name)) ? guessAudioMime(getExt(picked.name)) : guessVideoMime(getExt(picked.name)))
      : (original.mediaType ?? null)) ||
    (effectiveUrl ? inferMediaTypeFromUrl(effectiveUrl) : null);

  const Form = (
    <>
      <View style={S.header}>
        <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={S.headerTitle}>{editId ? 'Sửa bài nghe' : 'Tạo bài nghe'}</Text>
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
            {/* Title */}
            <Text style={CS.label}>Tiêu đề</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Unit 1 - Greetings"
              placeholderTextColor={COLORS.muted}
              style={CS.input}
            />

            {/* Transcript */}
            <Text style={CS.label}>Transcript</Text>
            <TextInput
              value={transcript}
              onChangeText={setTranscript}
              placeholder="A: Hello! How are you? ..."
              placeholderTextColor={COLORS.muted}
              multiline
              style={[CS.input, CS.inputMultiline]}
            />

            {/* Level */}
            <Text style={CS.label}>Level</Text>
            <LevelPickerRow value={level} onChange={onChangeLevel} />

            {/* Published */}
            <View style={CS.publishedRow}>
              <Text style={CS.label}>Published</Text>
              <TouchableOpacity
                onPress={() => setPublished((v) => !v)}
                activeOpacity={0.9}
                style={[
                  CS.publishToggleBase,
                  published ? CS.publishToggleOn : CS.publishToggleOff,
                ]}>
                <Text style={CS.publishToggleText}>{published ? 'ON' : 'OFF'}</Text>
              </TouchableOpacity>
            </View>

            {/* Exercise Type */}
            <Text style={CS.label}>Exercise Type</Text>
            <TextInput value={exerciseType} editable={false} style={[CS.input, CS.exerciseTypeInput]} />

            {/* Payload JSON */}
            <Text style={CS.label}>Payload (JSON theo dạng bài)</Text>
            <View style={CS.payloadButtonsRow}>
              <TouchableOpacity
                disabled={busy}
                onPress={() => {
                  setPayloadText(JSON.stringify(TEMPLATE_BY_TYPE[exerciseType], null, 2));
                  setPayloadTouched(true);
                }}
                style={[CS.pickBtn, CS.payloadTemplateBtn]}
                activeOpacity={0.85}>
                <Text style={CS.pickBtnText}>Dán template</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              value={payloadText}
              onChangeText={(t) => {
                setPayloadText(t);
                setPayloadTouched(true);
              }}
              multiline
              style={[CS.input, CS.inputMultiline, CS.payloadInput]}
              autoCapitalize="none"
            />

            {/* URL */}
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
              <Text style={CS.fileName}>Giữ nguyên URL cũ: {original.audioUrl}</Text>
            )}

            {/* Pick file */}
            <TouchableOpacity disabled={busy} onPress={pickMedia} style={CS.pickBtn}>
              <Text style={CS.pickBtnText}>
                {picked ? 'Chọn lại file (mp3/mp4)' : 'Chọn file từ máy (mp3/mp4)'}
              </Text>
            </TouchableOpacity>

            {!!picked && (
              <Text style={CS.fileName} numberOfLines={1}>
                📄 {picked.name}
              </Text>
            )}

            {/* Preview */}
            {!!effectiveUrl && <MediaPreview uri={effectiveUrl} mediaType={effectiveMediaType} />}

            {busy && (
              <Text style={CS.progressText}>Đang upload… {progress}%</Text>
            )}

            {/* Save */}
            <TouchableOpacity disabled={busy} onPress={onSave} style={CS.saveBtn}>
              {busy ? (
                <ActivityIndicator color={COLORS.bg} />
              ) : (
                <Text style={CS.saveBtnText}>{editId ? 'Cập nhật' : 'Lưu'}</Text>
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={[S.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" />
        {Form}
      </View>
    </TouchableWithoutFeedback>
  );
}
