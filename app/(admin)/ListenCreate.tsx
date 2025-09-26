// app/(admin)/ListenCreate.tsx
import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    Modal,
    Platform,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/* Styles */
import { ListenCreateStyles as CS } from '@/components/style/ListenCreateStyles';
import { COLORS, ListenStyles as S } from '@/components/style/ListenStyles';

/* Firestore (lưu metadata) */
import { db } from '@/scripts/firebase';
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

/* ================== Cloudinary Config ================== */
const CLOUD_NAME   = 'djf9vnngm';        // đổi theo của bạn
const CLOUD_PRESET = 'unsigned_mobile';  // unsigned preset
const CLOUD_FOLDER = 'lessons';          // folder gốc

/* ================= Types ================= */
type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
type ListenDoc = {
  title: string;
  transcript: string;
  audioUrl?: string;
  mediaType?: string | null;
  level: CEFR;
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

/* ================= Cloudinary upload (audio + video) ================= */
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
      if (onProgress && e.lengthComputable) onProgress(Math.round((e.loaded / Math.max(e.total, 1)) * 100));
    };
    xhr.onreadystatechange = () => { if (xhr.readyState === 4) resolve({ status: xhr.status, text: xhr.responseText }); };
    xhr.onerror = (err) => reject(err);
    xhr.open('POST', url);
    xhr.send(form);
  });

  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Cloudinary upload failed (${res.status}): ${res.text}`);
  }

  let json: any = {};
  try { json = JSON.parse(res.text); } catch (e) {
    throw new Error(`Cloudinary response parse error: ${String(e)}\n${res.text}`);
  }

  const public_id: string  = json.public_id;
  const secure_url: string = json.secure_url;

  const forceAudioMp3 = opts?.forceAudioMp3 ?? true;
  const videoDelivery = opts?.videoDelivery ?? 'mp4';

  let deliveryUrl = secure_url;
  let mediaType   = mime;

  if (isAudio) {
    if (forceAudioMp3) {
      deliveryUrl = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/f_mp3,q_auto:good/${public_id}.mp3`;
      mediaType   = 'audio/mpeg';
    } else {
      deliveryUrl = secure_url;
      mediaType   = mime;
    }
  } else {
    if (videoDelivery === 'hls') {
      deliveryUrl = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/sp_auto,q_auto:good/${public_id}.m3u8`;
      mediaType   = 'application/x-mpegURL';
    } else {
      deliveryUrl = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/f_mp4,q_auto:good/${public_id}.mp4`;
      mediaType   = 'video/mp4';
    }
  }

  return { secure_url, public_id, deliveryUrl, mediaType, isAudio };
}

/* ================= Level Picker ================= */
const LEVELS: CEFR[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
function LevelPickerRow({ value, onChange }: { value: CEFR; onChange: (v: CEFR) => void; }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TouchableOpacity style={[S.filterPicker, { marginBottom: 12 }]} onPress={() => setOpen(true)} activeOpacity={0.85}>
        <Text style={S.filterValueText}>{value}</Text>
        <Ionicons name="chevron-down" size={16} color={COLORS.muted} style={S.filterChevron} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={() => setOpen(false)}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}} style={{ width: '86%', maxWidth: 380, backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.borderSoft, overflow: 'hidden' }}>
            <View style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
              <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: '700' }}>Chọn cấp độ</Text>
            </View>
            {LEVELS.map((lv) => (
              <TouchableOpacity key={lv} style={{ paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} activeOpacity={0.9} onPress={() => { onChange(lv); setOpen(false); }}>
                <Text style={{ color: COLORS.text, fontSize: 15, fontWeight: value === lv ? '700' : '500' }}>{lv}</Text>
                {value === lv && <Ionicons name="checkmark" size={18} color={COLORS.create} />}
              </TouchableOpacity>
            ))}
            <View style={{ padding: 12, borderTopWidth: 1, borderTopColor: COLORS.border, alignItems: 'flex-end' }}>
              <TouchableOpacity onPress={() => setOpen(false)} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: COLORS.card2, borderWidth: 1, borderColor: COLORS.border }}>
                <Text style={{ color: COLORS.text, fontWeight: '700' }}>Đóng</Text>
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

  if (!isVideoMedia) {
    return (
      <View style={{ marginTop: 12, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border }}>
        <View style={{ backgroundColor: COLORS.card, padding: 12 }}>
          <Text style={{ color: COLORS.text, fontWeight: '700', marginBottom: 8 }}>Preview Audio</Text>
          <Video source={{ uri }} useNativeControls style={{ width: '100%', height: 56 }} shouldPlay={false} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ marginTop: 12, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border }}>
      <View style={{ backgroundColor: COLORS.card, padding: 12 }}>
        <Text style={{ color: COLORS.text, fontWeight: '700', marginBottom: 8 }}>Preview Video</Text>
        <View style={{ width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000' }}>
          <Video
            source={{ uri }}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            style={{ width: '100%', height: '100%' }}
            shouldPlay={false}
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

  const [picked, setPicked] = useState<{ name: string; uri: string; file?: File | null; mimeType?: string | null } | null>(null);

  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [speedText] = useState(''); // để đồng nhất UI
  const [etaText] = useState('');

  const [original, setOriginal] = useState<{ audioUrl?: string; mediaType?: string | null }>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!editId) return;
      try {
        setLoadingDoc(true);
        const snap = await getDoc(doc(db, 'listens', editId));
        if (snap.exists() && mounted) {
          const d = snap.data() as ListenDoc & { audioUrl?: string; mediaType?: string | null };
          setTitle(d.title || '');
          setTranscript(d.transcript || '');
          setLevel((d.level as CEFR) || 'A1');
          setUrlInput(d.audioUrl || '');
          setOriginal({ audioUrl: d.audioUrl, mediaType: d.mediaType ?? null });
        } else if (mounted) {
          Alert.alert('Không tìm thấy bài nghe', 'Bản ghi có thể đã bị xoá.');
          router.back();
        }
      } catch (e: any) {
        console.error(e);
        if (mounted) Alert.alert('Lỗi', e?.message ?? 'Không tải được dữ liệu.');
      } finally {
        if (mounted) setLoadingDoc(false);
      }
    })();
    return () => { mounted = false; };
  }, [editId, router]);

  const isVideoPickedOrUrl = useMemo(() => {
    if (picked?.name) {
      const ext = getExt(picked.name, 'mp4');
      const isVid = !isAudioExt(ext);
      return isVid;
    }
    const u = (urlInput || original.audioUrl || '').trim().toLowerCase();
    return isVideoUrl(u);
  }, [picked, urlInput, original.audioUrl]);

  const pickMedia = async () => {
    const r = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
      type: [
        // video
        'video/mp4', 'video/quicktime', 'video/x-m4v', 'video/webm',
        // audio
        'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-m4a',
      ],
    });
    if (r.canceled) return;
    const f = r.assets?.[0];
    if (f?.uri) {
      setPicked({
        name: f.name ?? 'media',
        uri: f.uri,
        // @ts-ignore (web có .file/.mimeType)
        file: (f as any)?.file ?? null,
        mimeType: (f as any)?.mimeType ?? null,
      });
    }
  };

  const onSave = async () => {
    Keyboard.dismiss();

    if (!title.trim()) {
      Alert.alert('Thiếu tiêu đề', 'Vui lòng nhập tiêu đề.');
      return;
    }
    if (!picked?.uri && !urlInput.trim() && !original.audioUrl) {
      Alert.alert('Thiếu nội dung', 'Chọn file hoặc nhập URL (mp3/mp4/m3u8).');
      return;
    }

    setBusy(true);
    setProgress(0);

    try {
      let finalUrl = urlInput.trim() || original.audioUrl || '';
      let mediaType: string | undefined | null = original.mediaType ?? null;

      // Nếu có file chọn → upload Cloudinary (áp dụng cho cả audio & video)
      if (picked?.uri) {
        const ext = getExt(picked.name || 'media');
        const { deliveryUrl, mediaType: mt } = await uploadMediaToCloudinary(
          picked.uri,
          'units',                 // thư mục con — tuỳ bạn
          slugify(title),
          (pct) => setProgress(pct),
          {
            forceAudioMp3: true,   // audio phát MP3 cho tương thích rộng
            videoDelivery: 'mp4',  // đổi 'hls' nếu muốn adaptive
          }
        );
        finalUrl  = deliveryUrl;
        mediaType = mt;
      }

      // Nếu không upload file (dùng URL có sẵn) → đoán MIME
      if (!mediaType && finalUrl) {
        mediaType = inferMediaTypeFromUrl(finalUrl);
      }

      // Lưu Firestore
      if (editId) {
        await updateDoc(doc(db, 'listens', editId), {
          title: title.trim(),
          transcript: transcript.trim(),
          audioUrl: finalUrl || null,
          mediaType: mediaType ?? null,
          level,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'listens'), {
          title: title.trim(),
          transcript: transcript.trim(),
          audioUrl: finalUrl,
          mediaType: mediaType ?? null,
          level,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      router.replace('/(admin)/listen');
    } catch (e: any) {
      console.error(e);
      Alert.alert('Lỗi', e?.message ?? 'Không thể lưu');
    } finally {
      setBusy(false);
      setProgress(0);
    }
  };

  // ---------- UI ----------
  const effectiveUrl = (urlInput || original.audioUrl || '').trim();
  const effectiveMediaType =
    (picked?.name
      ? (isAudioExt(getExt(picked.name)) ? guessAudioMime(getExt(picked.name)) : guessVideoMime(getExt(picked.name)))
      : (original.mediaType ?? null))
    || (effectiveUrl ? inferMediaTypeFromUrl(effectiveUrl) : null);

  const Form = (
    <>
      {/* Header */}
      <View style={S.header}>
        <TouchableOpacity onPress={() => router.back()} style={S.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={S.headerTitle}>{editId ? 'Sửa bài nghe' : 'Tạo bài nghe'}</Text>
        <View style={{ width: 22 }} />
      </View>

      {loadingDoc ? (
        <View style={{ padding: 24 }}>
          <ActivityIndicator color={COLORS.create} />
        </View>
      ) : (
        <View style={CS.screen}>
          {/* Title */}
          <Text style={CS.label}>Tiêu đề</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Unit 1 - Greetings"
            placeholderTextColor={COLORS.muted}
            style={CS.input}
            returnKeyType="next"
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
          <LevelPickerRow value={level} onChange={(v) => setLevel(v)} />

          {/* URL */}
          <Text style={CS.label}>URL (mp3/mp4/m3u8) nếu đã có (Cloudinary/Firebase/CDN)</Text>
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
          <TouchableOpacity disabled={busy} onPress={pickMedia} style={CS.pickBtn} activeOpacity={0.85}>
            <Text style={CS.pickBtnText}>
              {picked ? 'Chọn lại file (mp3/mp4)' : 'Chọn file từ máy (mp3/mp4)'}
            </Text>
          </TouchableOpacity>

          {!!picked && (
            <Text style={CS.fileName} numberOfLines={1}>
              📄 {picked.name} {isVideoPickedOrUrl ? '• 🎞️ video' : '• 🔊 audio'}
            </Text>
          )}

          {/* Preview (ưu tiên URL nhập để xem đúng link deploy) */}
          {!!effectiveUrl && (
            <MediaPreview uri={effectiveUrl} mediaType={effectiveMediaType} />
          )}

          {busy && (
            <Text style={CS.progressText}>
              Đang upload… {progress}% {speedText ? `• ${speedText}` : ''} {etaText ? `• ${etaText}` : ''}
            </Text>
          )}

          {/* Save */}
          <TouchableOpacity disabled={busy} onPress={onSave} style={CS.saveBtn} activeOpacity={0.9}>
            {busy ? <ActivityIndicator color={COLORS.bg} /> : (
              <Text style={CS.saveBtnText}>{editId ? 'Cập nhật' : 'Lưu'}</Text>
            )}
          </TouchableOpacity>
        </View>
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
