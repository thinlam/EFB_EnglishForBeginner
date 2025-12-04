// ===============================
// SCREEN: Create Listen (Firebase Storage Version)
// ===============================

import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/* Styles */
import { ListenCreateStyles as CS } from '@/components/style/admin/listen/listen-create-styles';
import { COLORS, ListenStyles as S } from '@/components/style/admin/listen/listen-screen-styles';

/* Firebase */
import { db, storage } from "@/scripts/firebase";
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

/* expo-video */
import { VideoView, useVideoPlayer } from 'expo-video';


// ======================
// UTILS
// ======================
type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '').slice(0, 60);
}

function inferMediaType(url: string) {
  const l = url.toLowerCase();
  if (l.endsWith(".mp3")) return "audio/mpeg";
  if (l.endsWith(".wav")) return "audio/wav";
  if (l.endsWith(".m4a")) return "audio/x-m4a";
  if (l.endsWith(".mp4")) return "video/mp4";
  if (l.endsWith(".mov")) return "video/quicktime";
  return "audio/mpeg";
}


// ======================
// MEDIA PREVIEW
// ======================
function MediaPreview({ uri, mediaType }: { uri: string | null; mediaType?: string | null }) {

  // ALWAYS INIT player with a safe source
  const player = useVideoPlayer(
    null, // <— MUST be null, NOT undefined
    (p) => {
      p.loop = false;
    }
  );

  const isVideo = mediaType?.startsWith("video/");

  // Replace source when uri changes
  useEffect(() => {
    if (uri) {
      player.replace({ uri });  // expo-video v2 expects an object
    }
  }, [uri]);


  // No media → return empty container (NOT null)
  if (!uri) {
    return <View style={{ height: 10 }} />;
  }

  return (
    <View style={CS.mediaPreviewWrapper}>
      <Text style={CS.mediaPreviewTitle}>
        Preview {isVideo ? "Video" : "Audio"}
      </Text>

      <View
        style={
          isVideo
            ? CS.mediaPreviewPlayerVideo
            : CS.mediaPreviewPlayerAudio
        }
      >
        <VideoView
          player={player}
          style={CS.mediaPreviewVideoView}
          contentFit="contain"
        />
      </View>
    </View>
  );
}



// ======================
// MAIN SCREEN
// ======================
export default function ListenCreate() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const editId = params?.id || '';

  const [loadingDoc, setLoadingDoc] = useState(!!editId);

  const [title, setTitle] = useState('');
  const [transcript, setTranscript] = useState('');
  const [level, setLevel] = useState<CEFR>('A1');

  const [picked, setPicked] = useState<{ name: string; uri: string } | null>(null);
  const [exerciseFile, setExerciseFile] = useState<{ name: string; uri: string } | null>(null);

  const [originalMedia, setOriginalMedia] = useState<{ url?: string | null; mediaType?: string | null }>({});
  const [originalExercise, setOriginalExercise] = useState<{ url?: string | null; name?: string | null }>({});

  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);


  // LOAD DOC WHEN EDIT
  useEffect(() => {
    if (!editId) return;

    (async () => {
      try {
        const snap = await getDoc(doc(db, 'listens', editId));
        if (!snap.exists()) return router.back();

        const d = snap.data() as any;

        setTitle(d.title || '');
        setTranscript(d.transcript || '');
        setLevel(d.level || 'A1');

        setOriginalMedia({
          url: d.audioUrl,
          mediaType: d.mediaType || null,
        });

        setOriginalExercise({
          url: d.exerciseFileUrl,
          name: d.exerciseFileName
        });

      } catch (err) {
        Alert.alert("Lỗi", "Không tải được dữ liệu");
      } finally {
        setLoadingDoc(false);
      }
    })();
  }, []);

  // PICK MEDIA
  const pickMedia = async () => {
    const r = await DocumentPicker.getDocumentAsync({
      type: ["audio/*", "video/*"],
      copyToCacheDirectory: true,
    });

    if (r.canceled) return;
    const f = r.assets?.[0];
    if (f?.uri) {
      setPicked({
        name: f.name ?? "media",
        uri: f.uri,
      });
    }
  };

  // PICK EXERCISE FILE
  const pickExercise = async () => {
    const r = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      copyToCacheDirectory: true,
    });

    if (r.canceled) return;
    const f = r.assets?.[0];
    if (f?.uri) {
      setExerciseFile({
        name: f.name!,
        uri: f.uri
      });
    }
  };


  // FIREBASE UPLOAD
  async function uploadToFirebase(localUri: string, path: string, onProgress: (p: number) => void) {
    const response = await fetch(localUri);
    const blob = await response.blob();

    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, blob);

    return new Promise<string>((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snap) => {
          const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          onProgress(pct);
        },
        (err) => reject(err),
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        }
      );
    });
  }


  // SAVE
  const onSave = async () => {
    Keyboard.dismiss();

    if (!title.trim()) return Alert.alert("Thiếu Title");
    if (!picked?.uri && !originalMedia.url)
      return Alert.alert("Thiếu file media");

    setBusy(true);
    setProgress(0);

    try {
      //-- Upload media
      let finalUrl = originalMedia.url || null;
      let mediaType = originalMedia.mediaType || null;

      if (picked?.uri) {
        const ext = picked.name.toLowerCase().split('.').pop();
        const baseName = slugify(title);

        const path = `listen/${baseName}_${Date.now()}.${ext}`;
        finalUrl = await uploadToFirebase(picked.uri, path, setProgress);
        mediaType = inferMediaType(finalUrl);
      }

      //-- Upload exercise file
      let exerciseFileUrl = originalExercise.url ?? null;
      let exerciseFileName = originalExercise.name ?? null;

      if (exerciseFile?.uri) {
        const ext = exerciseFile.name.split('.').pop();
        const path = `listen/files/${slugify(title)}_${Date.now()}.${ext}`;

        exerciseFileUrl = await uploadToFirebase(exerciseFile.uri, path, setProgress);
        exerciseFileName = exerciseFile.name;
      }

      //-- SAVE FIRESTORE
      const payload = {
        title: title.trim(),
        transcript: transcript.trim(),
        level,
        audioUrl: finalUrl!,
        mediaType,
        exerciseFileUrl,
        exerciseFileName,
        updatedAt: serverTimestamp(),
      };

      if (editId) {
        await updateDoc(doc(db, "listens", editId), payload);
      } else {
        await addDoc(collection(db, "listens"), {
          ...payload,
          isPublished: false,
          createdAt: serverTimestamp(),
        });
      }

      router.replace("/(admin)/listen/listen-screen");

    } catch (err: any) {
      Alert.alert("Lỗi", err.message ?? "Không thể lưu");
    } finally {
      setBusy(false);
      setProgress(0);
    }
  };


  // PREVIEW
  const effectiveUrl = picked?.uri || originalMedia.url || null;
  const effectiveMediaType = picked
    ? inferMediaType(picked.name)
    : originalMedia.mediaType;


  // UI
  const Form = (
    <>
      <View style={S.header}>
        <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={S.headerTitle}>{editId ? "Sửa bài nghe" : "Tạo bài nghe"}</Text>
        <View />
      </View>

      {loadingDoc ? (
        <View style={CS.loadingContainer}>
          <ActivityIndicator color={COLORS.create} />
        </View>
      ) : (
        <ScrollView
          style={CS.scroll}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        >
          <View style={CS.screen}>
            {/* INFO */}
            <View style={CS.sectionCard}>
              <Text style={CS.sectionTitle}>Thông tin</Text>

              <Text style={CS.label}>Title</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                style={CS.input}
                placeholder="Unit 1 - Greetings"
                placeholderTextColor={COLORS.muted}
              />

              <Text style={CS.label}>Level</Text>
              <TextInput
                value={level}
                editable={false}
                style={CS.input}
              />

              <Text style={CS.label}>Transcript</Text>
              <TextInput
                value={transcript}
                onChangeText={setTranscript}
                multiline
                style={[CS.input, CS.inputMultiline]}
                placeholder="A: Hello! How are you?"
                placeholderTextColor={COLORS.muted}
              />
            </View>


            {/* MEDIA */}
            <View style={CS.sectionCard}>
              <Text style={CS.sectionTitle}>Media</Text>

              <TouchableOpacity
                onPress={pickMedia}
                style={CS.pickBtn}
              >
                <Text style={CS.pickBtnText}>
                  {picked ? "Chọn lại file" : "Chọn file từ máy"}
                </Text>
              </TouchableOpacity>

              {picked && (
                <Text style={CS.fileName}>📄 {picked.name}</Text>
              )}

              {effectiveUrl && (
                <MediaPreview uri={effectiveUrl} mediaType={effectiveMediaType} />
              )}

              {busy && (
                <Text style={CS.progressText}>Đang upload… {progress}%</Text>
              )}
            </View>


            {/* EXERCISE FILE */}
            <View style={CS.sectionCard}>
              <Text style={CS.sectionTitle}>Tài liệu (Word/PDF)</Text>

              <TouchableOpacity onPress={pickExercise} style={CS.pickBtn}>
                <Text style={CS.pickBtnText}>Chọn file tài liệu</Text>
              </TouchableOpacity>

              {(exerciseFile || originalExercise.url) && (
                <Text style={CS.fileName}>
                  📎 {exerciseFile?.name || originalExercise.name}
                </Text>
              )}
            </View>


            {/* SAVE */}
            <TouchableOpacity
              disabled={busy || !title || !effectiveUrl}
              onPress={onSave}
              style={[
                CS.saveBtn,
                (busy || !title || !effectiveUrl) && CS.saveBtnDisabled,
              ]}
            >
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={CS.saveBtnText}>{editId ? "Cập nhật" : "Lưu"}</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </>
  );


  if (Platform.OS === "web") {
    return (
      <View style={[S.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" />
        {Form}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[S.container, { paddingTop: insets.top }]}>
          <StatusBar barStyle="light-content" />
          {Form}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
