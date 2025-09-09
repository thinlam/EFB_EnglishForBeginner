import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/* Firebase */
import { db, storage } from '@/scripts/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

/* helpers */
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

// Web: dùng File; Native: thử Blob -> fallback base64 (Uint8Array) + kiểm tra file rỗng
async function getUploadData(p: { uri: string; file?: File | null }): Promise<Blob | File | Uint8Array> {
  if (Platform.OS === 'web' && p.file) return p.file;

  // Native: thử blob trước
  try {
    const res = await fetch(p.uri);
    const blob = await res.blob();
    if ((blob as any)?.size > 0) return blob;
  } catch {}

  // Fallback: kiểm tra file tồn tại + đọc base64
  const info = await FileSystem.getInfoAsync(p.uri);
  if (!info.exists || (info.size ?? 0) === 0) {
    throw new Error('File không tồn tại hoặc kích thước = 0 (iOS có thể trả URI không hợp lệ), vui lòng chọn lại.');
  }
  const base64 = await FileSystem.readAsStringAsync(p.uri, { encoding: FileSystem.EncodingType.Base64 });
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return bytes;
}

export default function ListenCreateSingleRoute() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [transcript, setTranscript] = useState('');
  const [urlInput, setUrlInput] = useState(''); // có thể dán URL có sẵn
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
        // @ts-ignore (expo có thể chưa expose)
        file: (f as any)?.file ?? null,
        mimeType: (f as any)?.mimeType ?? null,
      });
    }
  };

  const onSave = async () => {
    if (!title.trim()) {
      Alert.alert('Thiếu tiêu đề', 'Vui lòng nhập tiêu đề.');
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

        const data = await getUploadData(picked);

        await new Promise<void>((resolve, reject) => {
          const start = Date.now();
          const task = uploadBytesResumable(storageRef, data as any, {
            contentType: mime || 'application/octet-stream',
          });

          task.on(
            'state_changed',
            (s) => {
              if (!s.totalBytes) {
                setProgress(0);
                return;
              }
              const pct = Math.round((s.bytesTransferred / s.totalBytes) * 100);
              setProgress(pct);

              const elapsed = (Date.now() - start) / 1000; // giây
              const speed = s.bytesTransferred / Math.max(elapsed, 0.001); // bytes/s
              const remain = (s.totalBytes - s.bytesTransferred) / Math.max(speed, 1);
              setSpeedText(`${(speed / 1e6).toFixed(2)} MB/s`);
              setEtaText(`ETA ${remain.toFixed(1)}s`);
            },
            (err: any) => {
              const server =
                err?.customData?.serverResponse ||
                err?.serverResponse ||
                err?.message ||
                JSON.stringify(err);
              Alert.alert('Upload lỗi', `${err?.code ?? ''}\n${server}`);
              reject(err);
            },
            () => resolve()
          );
        });

        finalUrl = await getDownloadURL(storageRef);
        mediaType = mime;
      }

      if (!mediaType && finalUrl) {
        mediaType = finalUrl.toLowerCase().endsWith('.mp4') ? 'video/mp4' : 'audio/mpeg';
      }

      await addDoc(collection(db, 'listens'), {
        title: title.trim(),
        transcript: transcript.trim(),
        audioUrl: finalUrl,       // giữ field cũ
        mediaType: mediaType ?? null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      router.replace('/listen');
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
    <View style={{ flex: 1, backgroundColor: '#0b1220', paddingTop: insets.top, padding: 16 }}>
      <StatusBar barStyle="light-content" />
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 16 }}>
        Tạo bài nghe (mp3/mp4)
      </Text>

      <Text style={{ color: '#9ca3af', marginBottom: 6 }}>Tiêu đề</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Unit 1 - Greetings"
        placeholderTextColor="#64748b"
        style={{
          color: '#fff',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.1)',
          borderRadius: 10,
          padding: 12,
          marginBottom: 12,
        }}
      />

      <Text style={{ color: '#9ca3af', marginBottom: 6 }}>Transcript</Text>
      <TextInput
        value={transcript}
        onChangeText={setTranscript}
        placeholder="A: Hello! How are you? ..."
        placeholderTextColor="#64748b"
        multiline
        style={{
          color: '#fff',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.1)',
          borderRadius: 10,
          padding: 12,
          marginBottom: 12,
          minHeight: 90,
        }}
      />

      <Text style={{ color: '#9ca3af', marginBottom: 6 }}>URL (mp3/mp4) nếu đã có</Text>
      <TextInput
        value={urlInput}
        onChangeText={setUrlInput}
        autoCapitalize="none"
        placeholder="https://…(.mp3 | .mp4)"
        placeholderTextColor="#64748b"
        style={{
          color: '#fff',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.1)',
          borderRadius: 10,
          padding: 12,
          marginBottom: 12,
        }}
      />

      <TouchableOpacity
        disabled={busy}
        onPress={pickMedia}
        style={{
          backgroundColor: '#3b82f6',
          padding: 12,
          borderRadius: 10,
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '700' }}>
          {picked ? 'Chọn lại file (mp3/mp4)' : 'Chọn file từ máy (mp3/mp4)'}
        </Text>
      </TouchableOpacity>

      {!!picked && (
        <Text style={{ color: '#9ca3af', marginBottom: 6 }} numberOfLines={1}>
          📄 {picked.name}
        </Text>
      )}

      {busy && (
        <Text style={{ color: '#9ca3af', marginBottom: 10 }}>
          Đang upload… {progress}% {speedText ? `• ${speedText}` : ''} {etaText ? `• ${etaText}` : ''}
        </Text>
      )}

      <TouchableOpacity
        disabled={busy}
        onPress={onSave}
        style={{
          backgroundColor: '#4ade80',
          padding: 14,
          borderRadius: 12,
          alignItems: 'center',
        }}
      >
        {busy ? (
          <ActivityIndicator color="#0b1220" />
        ) : (
          <Text style={{ color: '#0b1220', fontWeight: '800' }}>Lưu</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
