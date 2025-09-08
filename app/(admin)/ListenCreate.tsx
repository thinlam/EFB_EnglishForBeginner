// app/(admin)/listencreate.tsx
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

export default function ListenCreateSingleRoute() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [transcript, setTranscript] = useState('');
  const [audioUrl, setAudioUrl] = useState(''); // nếu đã có URL sẵn thì nhập ở đây
  const [picked, setPicked] = useState<{ name: string; uri: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number>(0);

  const pickAudio = async () => {
    const r = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
      type: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-m4a'],
    });
    if (r.canceled) return;
    const f = r.assets?.[0];
    if (f?.uri) setPicked({ name: f.name ?? 'audio', uri: f.uri });
  };

  const onSave = async () => {
    if (!title.trim()) {
      Alert.alert('Thiếu tiêu đề', 'Vui lòng nhập tiêu đề.');
      return;
    }

    setBusy(true);
    setProgress(0);

    try {
      let finalUrl = audioUrl.trim();

      // nếu chọn file -> upload lên Storage
      if (picked?.uri) {
        const slug = slugify(title) || `listen-${Date.now()}`;
        const ext = picked.name?.split('.').pop() || 'mp3';
        const path = `listens/${slug}.${ext}`;

        const blob = await uriToBlob(picked.uri);
        const storageRef = ref(storage, path);

        await new Promise<void>((resolve, reject) => {
          const task = uploadBytesResumable(storageRef, blob, {
            contentType: blob.type || 'audio/mpeg',
          });
          task.on(
            'state_changed',
            (s) => {
              if (s.totalBytes) {
                setProgress(Math.round((s.bytesTransferred / s.totalBytes) * 100));
              }
            },
            (err) => reject(err),
            () => resolve()
          );
        });

        finalUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, 'listens'), {
        title: title.trim(),
        transcript: transcript.trim(),
        audioUrl: finalUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      Alert.alert('Thành công', 'Đã tạo bài nghe.', [
        { text: 'Về danh sách', onPress: () => router.replace('/listen') },
        { text: 'Ở lại đây' },
      ]);
      // reset form nhẹ
      setTitle('');
      setTranscript('');
      setAudioUrl('');
      setPicked(null);
      setProgress(0);
    } catch (e: any) {
      console.error(e);
      Alert.alert('Lỗi', e?.message ?? 'Không thể lưu');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0b1220', paddingTop: insets.top, padding: 16 }}>
      <StatusBar barStyle="light-content" />
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
        Tạo bài nghe
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

      <Text style={{ color: '#9ca3af', marginBottom: 6 }}>Audio URL (nếu đã có)</Text>
      <TextInput
        value={audioUrl}
        onChangeText={setAudioUrl}
        autoCapitalize="none"
        placeholder="https://..."
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
        onPress={pickAudio}
        style={{
          backgroundColor: '#3b82f6',
          padding: 12,
          borderRadius: 10,
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '700' }}>
          {picked ? 'Chọn lại file audio' : 'Chọn file audio từ máy'}
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
