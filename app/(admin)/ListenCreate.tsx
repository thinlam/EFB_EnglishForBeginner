// app/(admin)/ListenCreate.tsx
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    Modal,
    Platform,
    Pressable,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/* Styles dùng chung với màn list */
import { COLORS, ListenStyles as S } from '@/components/style/ListenStyles';

/* Firebase */
import { db, storage } from '@/scripts/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';


/* ================= Types ================= */
type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

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

/** Base64 → Uint8Array (fallback nếu RN không fetch được Blob) */
function base64ToBytes(b64: string) {
  // @ts-ignore
  const atobFn: ((s: string) => string) | undefined = globalThis?.atob;
  if (!atobFn) {
    throw new Error(
      'Thiếu hàm atob để giải mã base64. Cài thêm "base-64" hoặc bật polyfill, hoặc để fetch->blob hoạt động.'
    );
  }
  const bin = atobFn(b64);
  const len = bin.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/**
 * Web: dùng File; Native: thử fetch(uri) -> blob;
 * nếu thất bại → đọc base64 và chuyển Uint8Array
 */
async function getUploadData(p: { uri: string; file?: File | null }): Promise<Blob | File | Uint8Array> {
  if (Platform.OS === 'web' && p.file) return p.file;

  try {
    const res = await fetch(p.uri);
    const blob = await res.blob();
    if ((blob as any)?.size > 0) return blob;
  } catch {
    // ignore, fallback base64
  }

  const info = await FileSystem.getInfoAsync(p.uri);
  if (!info.exists || (info.size ?? 0) === 0) {
    throw new Error('File không tồn tại hoặc kích thước = 0. Vui lòng chọn lại file.');
  }

  const base64 = await FileSystem.readAsStringAsync(p.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return base64ToBytes(base64);
}

/* ================= iOS/Android Level Picker (cross-platform) ================= */
function LevelPickerRow({
  value,
  onChange,
}: {
  value: CEFR;
  onChange: (v: CEFR) => void;
}) {
  const [iosOpen, setIosOpen] = useState(false);

  if (Platform.OS === 'ios') {
    return (
      <>
        {/* Hàng hiển thị hiện tại, bấm để mở Modal (iOS) */}
        <Pressable
          onPress={() => setIosOpen(true)}
          style={[S.filterPicker, { marginBottom: 12 }]}
        >
          <Text style={S.filterValueText}>{value}</Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color={COLORS.muted}
            style={S.filterChevron}
          />
        </Pressable>

        {/* Modal iOS với bánh xe Picker + Done */}
        <Modal
          visible={iosOpen}
          animationType="slide"
          transparent
          onRequestClose={() => setIosOpen(false)}
        >
          <Pressable
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }}
            onPress={() => setIosOpen(false)}
          />
          <View
            style={{
              backgroundColor: COLORS.card2,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              paddingBottom: 12,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}
            >
              <TouchableOpacity
                onPress={() => setIosOpen(false)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                  backgroundColor: COLORS.create,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                }}
                activeOpacity={0.9}
              >
                <Text style={{ color: COLORS.bg, fontWeight: '700' }}>Done</Text>
              </TouchableOpacity>
            </View>

            <Picker
              selectedValue={value}
              onValueChange={(v) => onChange(v as CEFR)}
              itemStyle={{ color: COLORS.text }}
            >
              <Picker.Item label="A1" value="A1" />
              <Picker.Item label="A2" value="A2" />
              <Picker.Item label="B1" value="B1" />
              <Picker.Item label="B2" value="B2" />
              <Picker.Item label="C1" value="C1" />
            </Picker>
          </View>
        </Modal>
      </>
    );
  }

  // Android: dropdown bình thường (giữ style hàng giống list)
  return (
    <View style={[S.filterPicker, { marginBottom: 12 }]}>
      <Text style={S.filterValueText}>{value}</Text>
      <Ionicons
        name="chevron-down"
        size={16}
        color={COLORS.muted}
        style={S.filterChevron}
      />
      {/* Lưu ý: S.hiddenPicker nên là absolute-fill + opacity:0 để click vào hàng vẫn mở dropdown */}
      <Picker
        selectedValue={value}
        onValueChange={(v) => onChange(v as CEFR)}
        mode="dropdown"
        style={S.hiddenPicker}
        dropdownIconColor={COLORS.muted}
      >
        <Picker.Item label="A1" value="A1" />
        <Picker.Item label="A2" value="A2" />
        <Picker.Item label="B1" value="B1" />
        <Picker.Item label="B2" value="B2" />
        <Picker.Item label="C1" value="C1" />
      </Picker>
    </View>
  );
}

/* ================= Screen ================= */
export default function ListenCreateScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [transcript, setTranscript] = useState('');
  const [urlInput, setUrlInput] = useState('');

  const [level, setLevel] = useState<CEFR>('A1');

  const [picked, setPicked] = useState<{
    name: string;
    uri: string;
    file?: File | null;
    mimeType?: string | null;
  } | null>(null);

  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [speedText, setSpeedText] = useState('');
  const [etaText, setEtaText] = useState('');

  const isVideo = useMemo(() => {
    if (picked?.name) return (guessContentType(picked.name).mime || '').startsWith('video/');
    const u = urlInput.trim().toLowerCase();
    return u.endsWith('.mp4') || u.endsWith('.m4v') || u.endsWith('.mov');
  }, [picked, urlInput]);

  const pickMedia = async () => {
    const r = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
      type: [
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/x-m4a',
        'video/mp4',
        'video/quicktime',
        'video/x-m4v',
      ],
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
    if (!picked?.uri && !urlInput.trim()) {
      Alert.alert('Thiếu nội dung', 'Chọn file hoặc nhập URL (mp3/mp4).');
      return;
    }

    setBusy(true);
    setProgress(0);
    setSpeedText('');
    setEtaText('');

    try {
      let finalUrl = urlInput.trim();
      let mediaType: string | undefined;

      if (picked?.uri) {
        const guessed = guessContentType(picked.name || '');
        const mime =
          picked.mimeType ||
          (picked.file && (picked.file as File).type) ||
          guessed.mime;
        const ext = (picked.name?.split('.').pop() || guessed.ext).toLowerCase();

        const slug = slugify(title) || `listen-${Date.now()}`;
        const path = `listens/${slug}.${ext}`;
        const storageRef = ref(storage, path);

        // Lấy dữ liệu upload + kiểm tra size
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

        // Upload + watchdog 10s nếu không tiến triển
        await new Promise<void>((resolve, reject) => {
          const start = Date.now();
          const task = uploadBytesResumable(storageRef, data as any, {
            contentType: mime || 'application/octet-stream',
          });

          const watchdog = setTimeout(() => {
            try {
              task.cancel();
            } catch {}
            reject(new Error('Upload không có tiến triển sau 10 giây. Kiểm tra quyền/URI/bucket/mạng.'));
          }, 10000);

          task.on(
            'state_changed',
            (s) => {
              if (!s.totalBytes) {
                setProgress(0);
                return;
              }
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
              const server =
                err?.customData?.serverResponse ||
                err?.serverResponse ||
                err?.message ||
                JSON.stringify(err);
              Alert.alert(
                'Upload lỗi',
                `${err?.code ?? 'storage/unknown'}\n${server}\n\nKiểu: ${dataKind}, size: ${dataSize}`
              );
              reject(err);
            },
            () => {
              clearTimeout(watchdog);
              resolve();
            }
          );
        });

        finalUrl = await getDownloadURL(storageRef);
        mediaType = mime;
      }

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

      await addDoc(collection(db, 'listens'), {
        title: title.trim(),
        transcript: transcript.trim(),
        audioUrl: finalUrl,
        mediaType: mediaType ?? null,
        level, // 🔹 lưu CEFR
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

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

  return (  
    <View style={[S.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Header với back + tiêu đề giữa để đồng bộ màn list */}
      <View style={S.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={S.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={S.headerTitle}>Tạo bài nghe</Text>

        {/* spacer giữ tiêu đề ở giữa */}
        <View style={{ width: 22 }} />
      </View>

      {/* Form */}
      <View style={{ padding: 16 }}>
        {/* Title */}
        <Text style={{ color: COLORS.muted, marginBottom: 6 }}>Tiêu đề</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Unit 1 - Greetings"
          placeholderTextColor={COLORS.muted}
          style={{
            color: COLORS.text,
            borderWidth: 1,
            borderColor: COLORS.borderSoft,
            backgroundColor: COLORS.card2,
            borderRadius: 10,
            padding: 12,
            marginBottom: 12,
          }}
          returnKeyType="next"
        />

        {/* Transcript */}
        <Text style={{ color: COLORS.muted, marginBottom: 6 }}>Transcript</Text>
        <TextInput
          value={transcript}
          onChangeText={setTranscript}
          placeholder="A: Hello! How are you? ..."
          placeholderTextColor={COLORS.muted}
          multiline
          style={{
            color: COLORS.text,
            borderWidth: 1,
            borderColor: COLORS.borderSoft,
            backgroundColor: COLORS.card2,
            borderRadius: 10,
            padding: 12,
            marginBottom: 12,
            minHeight: 90,
          }}
        />

        {/* Level picker (cross-platform) */}
        <Text style={{ color: COLORS.muted, marginBottom: 6 }}>Level</Text>
        <LevelPickerRow value={level} onChange={(v) => setLevel(v)} />

        {/* URL */}
        <Text style={{ color: COLORS.muted, marginBottom: 6 }}>
          URL (mp3/mp4) nếu đã có
        </Text>
        <TextInput
          value={urlInput}
          onChangeText={setUrlInput}
          autoCapitalize="none"
          placeholder="https://…(.mp3 | .mp4)"
          placeholderTextColor={COLORS.muted}
          style={{
            color: COLORS.text,
            borderWidth: 1,
            borderColor: COLORS.borderSoft,
            backgroundColor: COLORS.card2,
            borderRadius: 10,
            padding: 12,
            marginBottom: 12,
          }}
        />

        {/* Pick file */}
        <TouchableOpacity
          disabled={busy}
          onPress={pickMedia}
          style={{
            backgroundColor: COLORS.edit,
            padding: 12,
            borderRadius: 10,
            alignItems: 'center',
            marginBottom: 10,
            borderWidth: 1,
            borderColor: COLORS.border,
          }}
          activeOpacity={0.85}
        >
          <Text style={{ color: COLORS.text, fontWeight: '700' }}>
            {picked ? 'Chọn lại file (mp3/mp4)' : 'Chọn file từ máy (mp3/mp4)'}
          </Text>
        </TouchableOpacity>

        {!!picked && (
          <Text style={{ color: COLORS.muted, marginBottom: 6 }} numberOfLines={1}>
            📄 {picked.name} {isVideo ? '• 🎞️ video' : '• 🔊 audio'}
          </Text>
        )}

        {busy && (
          <Text style={{ color: COLORS.muted, marginBottom: 10 }}>
            Đang upload… {progress}% {speedText ? `• ${speedText}` : ''}{' '}
            {etaText ? `• ${etaText}` : ''}
          </Text>
        )}

        {/* Save */}
        <TouchableOpacity
          disabled={busy}
          onPress={onSave}
          style={{
            backgroundColor: COLORS.create,
            padding: 14,
            borderRadius: 12,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: COLORS.border,
          }}
          activeOpacity={0.9}
        >
          {busy ? (
            <ActivityIndicator color={COLORS.bg} />
          ) : (
            <Text style={{ color: COLORS.bg, fontWeight: '800' }}>Lưu</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
