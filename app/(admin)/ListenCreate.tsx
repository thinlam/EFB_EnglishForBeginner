// app/(admin)/ListenCreate.tsx
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
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

/* Firebase */
import { db, storage } from '@/scripts/firebase';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

/* ================= Types ================= */
type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
type ListenDoc = {
  title: string;
  transcript: string;
  audioUrl?: string;
  mediaType?: string | null;
  level: CEFR;
};

/* ================= Helpers ================= */
function slugify(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '').slice(0, 60);
}
function guessContentType(filename: string) {
  const ext = (filename?.split('.').pop() || '').toLowerCase();
  switch (ext) {
    case 'mp3':
    case 'mpeg':
      return { ext: 'mp3', mime: 'audio/mpeg' };
    case 'wav':
      return { ext: 'wav', mime: 'audio/wav' };
    case 'm4a':
      return { ext: 'm4a', mime: 'audio/x-m4a' };
    case 'mp4':
      return { ext: 'mp4', mime: 'video/mp4' };
    case 'm4v':
      return { ext: 'm4v', mime: 'video/x-m4v' };
    case 'mov':
      return { ext: 'mov', mime: 'video/quicktime' };
    default:
      return { ext: 'mp4', mime: 'video/mp4' };
  }
}
/** Base64 → Uint8Array (fallback) */
function base64ToBytes(b64: string) {
  // @ts-ignore
  const atobFn: ((s: string) => string) | undefined = globalThis?.atob;
  if (!atobFn) throw new Error('Thiếu atob để giải mã base64.');
  const bin = atobFn(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}
/** Web: File; Native: fetch(uri)->blob; fail → base64→Uint8Array */
async function getUploadData(p: { uri: string; file?: File | null }): Promise<Blob | File | Uint8Array> {
  if (Platform.OS === 'web' && p.file) return p.file;
  try {
    const res = await fetch(p.uri);
    const blob = await res.blob();
    if ((blob as any)?.size > 0) return blob;
  } catch {}
  const info = await FileSystem.getInfoAsync(p.uri);
  if (!info.exists || (info.size ?? 0) === 0) throw new Error('File không tồn tại hoặc size=0.');
  const base64 = await FileSystem.readAsStringAsync(p.uri, { encoding: FileSystem.EncodingType.Base64 });
  return base64ToBytes(base64);
}

/* ================= Custom Level Picker (dialog giữa màn hình) ================= */
const LEVELS: CEFR[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

function LevelPickerRow({
  value,
  onChange,
}: {
  value: CEFR;
  onChange: (v: CEFR) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Nút mở dialog */}
      <TouchableOpacity
        style={[S.filterPicker, { marginBottom: 12 }]}
        onPress={() => setOpen(true)}
        activeOpacity={0.85}
      >
        <Text style={S.filterValueText}>{value}</Text>
        <Ionicons name="chevron-down" size={16} color={COLORS.muted} style={S.filterChevron} />
      </TouchableOpacity>

      {/* Dialog giữa màn hình */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        {/* overlay: chạm ra ngoài để đóng */}
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' }}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          {/* chặn propagate để bấm trong hộp không tắt */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={{
              width: '86%',
              maxWidth: 380,
              backgroundColor: COLORS.card,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: COLORS.borderSoft,
              overflow: 'hidden',
            }}
          >
            <View style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
              <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: '700' }}>Chọn cấp độ</Text>
            </View>

            {LEVELS.map((lv) => (
              <TouchableOpacity
                key={lv}
                style={{ paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                activeOpacity={0.9}
                onPress={() => { onChange(lv); setOpen(false); }}
              >
                <Text style={{ color: COLORS.text, fontSize: 15, fontWeight: value === lv ? '700' : '500' }}>
                  {lv}
                </Text>
                {value === lv && <Ionicons name="checkmark" size={18} color={COLORS.create} />}
              </TouchableOpacity>
            ))}

            <View style={{ padding: 12, borderTopWidth: 1, borderTopColor: COLORS.border, alignItems: 'flex-end' }}>
              <TouchableOpacity
                onPress={() => setOpen(false)}
                style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: COLORS.card2, borderWidth: 1, borderColor: COLORS.border }}
              >
                <Text style={{ color: COLORS.text, fontWeight: '700' }}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
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
  const [speedText, setSpeedText] = useState('');
  const [etaText, setEtaText] = useState('');

  // Giữ giá trị cũ để nếu không thay đổi thì preserve
  const [original, setOriginal] = useState<{ audioUrl?: string; mediaType?: string | null }>({});

  // Load dữ liệu cũ nếu edit
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

  const isVideo = useMemo(() => {
    if (picked?.name) return (guessContentType(picked.name).mime || '').startsWith('video/');
    const u = (urlInput || original.audioUrl || '').trim().toLowerCase();
    return u.endsWith('.mp4') || u.endsWith('.m4v') || u.endsWith('.mov');
  }, [picked, urlInput, original.audioUrl]);

  const pickMedia = async () => {
    const r = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
      type: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-m4a', 'video/mp4', 'video/quicktime', 'video/x-m4v'],
    });
    if (r.canceled) return;
    const f = r.assets?.[0];
    if (f?.uri) {
      setPicked({
        name: f.name ?? 'media',
        uri: f.uri,
        // @ts-ignore expo web exposes .file/.mimeType
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
      Alert.alert('Thiếu nội dung', 'Chọn file hoặc nhập URL (mp3/mp4).');
      return;
    }

    setBusy(true);
    setProgress(0);
    setSpeedText('');
    setEtaText('');

    try {
      let finalUrl = urlInput.trim() || original.audioUrl || '';
      let mediaType: string | undefined | null = original.mediaType ?? null;

      // Nếu người dùng chọn file mới → upload
      if (picked?.uri) {
        const guessed = guessContentType(picked.name || '');
        const mime = picked.mimeType || (picked.file && (picked.file as File).type) || guessed.mime;
        const ext = (picked.name?.split('.').pop() || guessed.ext).toLowerCase();

        const slug = slugify(title) || `listen-${Date.now()}`;
        const path = `listens/${slug}.${ext}`;
        const storageRef = ref(storage, path);

        const data = await getUploadData(picked);
        let dataSize = 0;
        let dataKind = 'unknown';
        if (Platform.OS === 'web' && (data as any) instanceof File) {
          dataSize = (data as File).size || 0;
          dataKind = 'File';
        } else if (typeof (data as any).size === 'number') {
          dataSize = (data as any).size; // Blob
          dataKind = 'Blob';
        } else if (data instanceof Uint8Array) {
          dataSize = data.byteLength;
          dataKind = 'Uint8Array';
        }
        if (!dataSize) {
          Alert.alert('File rỗng', `Không đọc được dữ liệu (size=0). Kiểu: ${dataKind}`);
          setBusy(false);
          return;
        }

        await new Promise<void>((resolve, reject) => {
          const start = Date.now();
          const task = uploadBytesResumable(storageRef, data as any, {
            contentType: mime || 'application/octet-stream',
          });

          const watchdog = setTimeout(() => {
            try { task.cancel(); } catch {}
            reject(new Error('Upload không có tiến triển sau 10 giây.'));
          }, 10000);

          task.on(
            'state_changed',
            (s) => {
              if (!s.totalBytes) { setProgress(0); return; }
              const pct = Math.round((s.bytesTransferred / s.totalBytes) * 100);
              setProgress(pct);

              if (s.bytesTransferred > 0) {
                const elapsed = (Date.now() - start) / 1000;
                const speed = s.bytesTransferred / Math.max(elapsed, 0.001); // bytes/s
                const remain = (s.totalBytes - s.bytesTransferred) / Math.max(speed, 1);
                setSpeedText(`${(speed / 1e6).toFixed(2)} MB/s`);
                setEtaText(`ETA ${remain.toFixed(1)}s`);
              } else {
                setSpeedText('');
                setEtaText('');
              }
            },
            (err: any) => {
              clearTimeout(watchdog);
              const server = err?.customData?.serverResponse || err?.serverResponse || err?.message || JSON.stringify(err);
              Alert.alert('Upload lỗi', `${err?.code ?? 'storage/unknown'}\n${server}\n\nKiểu: ${dataKind}, size: ${dataSize}`);
              reject(err);
            },
            () => { clearTimeout(watchdog); resolve(); },
          );
        });

        finalUrl = await getDownloadURL(storageRef);
        mediaType = mime;
      }

      // Nếu có URL text nhưng chưa đoán mediaType
      if (!mediaType && finalUrl) {
        const lower = finalUrl.toLowerCase();
        mediaType =
          lower.endsWith('.mp4') || lower.endsWith('.m4v') || lower.endsWith('.mov')
            ? 'video/mp4'
            : lower.endsWith('.wav')
            ? 'audio/wav'
            : lower.endsWith('.m4a')
            ? 'audio/x-m4a'
            : 'audio/mpeg';
      }

      if (editId) {
        // UPDATE
        await updateDoc(doc(db, 'listens', editId), {
          title: title.trim(),
          transcript: transcript.trim(),
          audioUrl: finalUrl || null,
          mediaType: mediaType ?? null,
          level,
          updatedAt: serverTimestamp(),
        });
      } else {
        // CREATE
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
      setSpeedText('');
      setEtaText('');
    }
  };

  // 👉👉 CHỈ SỬA ĐIỂM NÀY: bọc dismiss bàn phím chỉ trên native, web dùng View thuần
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    Platform.OS === 'web' ? (
      <View style={[S.container, { paddingTop: insets.top }]}>{children}</View>
    ) : (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={[S.container, { paddingTop: insets.top }]}>{children}</View>
      </TouchableWithoutFeedback>
    );

  return (
    <Wrapper>
      <StatusBar barStyle="light-content" />

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
        /* Form */
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

          {/* URL (nếu có sẵn) */}
          <Text style={CS.label}>URL (mp3/mp4) nếu đã có</Text>
          <TextInput
            value={urlInput}
            onChangeText={setUrlInput}
            autoCapitalize="none"
            placeholder="https://…(.mp3 | .mp4)"
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
              📄 {picked.name} {isVideo ? '• 🎞️ video' : '• 🔊 audio'}
            </Text>
          )}

          {busy && (
            <Text style={CS.progressText}>
              Đang upload… {progress}% {speedText ? `• ${speedText}` : ''} {etaText ? `• ${etaText}` : ''}
            </Text>
          )}

          {/* Save */}
          <TouchableOpacity disabled={busy} onPress={onSave} style={CS.saveBtn} activeOpacity={0.9}>
            {busy ? <ActivityIndicator color={COLORS.bg} /> : <Text style={CS.saveBtnText}>{editId ? 'Cập nhật' : 'Lưu'}</Text>}
          </TouchableOpacity>
        </View>
      )}
    </Wrapper>
  );
}
