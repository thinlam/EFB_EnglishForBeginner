// app/(admin)/listencreate.tsx
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
async function uriToBlob(uri: string): Promise<Blob> {
  const res = await fetch(uri);
  return await res.blob();
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

// Web: dùng thẳng File; Native: thử blob -> fallback base64 (Uint8Array)
async function getUploadData(p: { uri: string; file?: File | null }): Promise<Blob | File | Uint8Array> {
  if (Platform.OS === 'web' && p.file) return p.file;       // Web có File từ picker

  // Native: thử blob trước
  try {
    const blob = await uriToBlob(p.uri);
    if ((blob as any)?.size > 0) return blob;
  } catch (_) {
    // ignore -> fallback
  }

  // Fallback: đọc base64 bằng FileSystem rồi chuyển thành Uint8Array
  const base64 = await FileSystem.readAsStringAsync(p.uri, { encoding: FileSystem.EncodingType.Base64 });
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return bytes;
}

export default function ListenCreateSingleRoute() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [transcript, setTranscript] = useState('');
  const [urlInput, setUrlInput] = useState(''); // có thể dán URL mp3/mp4 sẵn
  const [picked, setPicked] = useState<{
    name: string;
    uri: string;
    file?: File | null;        // web có
    mimeType?: string | null;  // web có
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number>(0);

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
        // @ts-ignore expo types có thể chưa expose .file/.mimeType
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

        const data = await getUploadData(picked); // File (web) | Blob (native) | Uint8Array (fallback)

        await new Promise<void>((resolve, reject) => {
          const task = uploadBytesResumable(storageRef, data as any, { contentType: mime });
          task.on(
            'state_changed',
            (s) => {
              if (s.totalBytes) {
                setProgress(Math.round((s.bytesTransferred / s.totalBytes) * 100));
              } else {
                setProgress(0);
              }
            },
            (err) => reject(err),
            () => resolve()
          );
        });

        finalUrl = await getDownloadURL(storageRef);
        mediaType = mime;
      }

      // nếu chỉ dán URL thủ công
      if (!mediaType && finalUrl) {
        mediaType = finalUrl.toLowerCase().endsWith('.mp4') ? 'video/mp4' : 'audio/mpeg';
      }

      await addDoc(collection(db, 'listens'), {
        title: title.trim(),
        transcript: transcript.trim(),
        audioUrl: finalUrl,       // giữ tên field cũ để list không cần sửa
        mediaType: mediaType ?? null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Trở về danh sách
      router.replace('/listen');
    } catch (e: any) {
      console.error(e);
      Alert.alert('Lỗi', e?.message ?? 'Không thể lưu');
    } finally {
      setBusy(false);
      setProgress(0);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0b1220', paddingTop: insets.top, padding: 16 }}>
      <StatusBar barStyle="light-content" />
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
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
        <Text style={{ color: '#9ca3af', marginBottom: 10 }} numberOfLines={1}>
          📄 {picked.name}
        </Text>
      )}

      {busy && (
        <Text style={{ color: '#9ca3af', marginBottom: 10 }}>
          Đang upload… {progress}%
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
