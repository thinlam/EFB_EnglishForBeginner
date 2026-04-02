import { ListenCreateStyles as CS } from "@/components/style/admin/listen";
import { COLORS } from "@/components/style/colors/AppColors";
import Dropdown from "@/components/ui/Dropdown";
import { db, storage } from "@/scripts/firebase";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import { VideoView, useVideoPlayer } from "expo-video";
import * as WebBrowser from "expo-web-browser";
import Toast from "react-native-toast-message";

import { useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

/* ============================
 * HELPERS
 * ============================ */
function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .slice(0, 60);
}

function inferMediaType(url: string) {
  const l = url.toLowerCase();
  if (l.endsWith(".mp4")) return "video/mp4";
  if (l.endsWith(".mov")) return "video/quicktime";
  if (l.endsWith(".mp3")) return "audio/mpeg";
  if (l.endsWith(".wav")) return "audio/wav";
  return "audio/mpeg";
}

/* ============================
 * MAIN COMPONENT
 * ============================ */
export default function ListenCreate() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();

  const editId = params.id || "";

  const [loadingDoc, setLoadingDoc] = useState(!!editId);

  const [title, setTitle] = useState("");
  const [transcript, setTranscript] = useState("");

  const [level, setLevel] = useState("");
  const [topic, setTopic] = useState("");

  const [pickedMedia, setPickedMedia] = useState<{ name: string; uri: string } | null>(null);
  const [pickedExercise, setPickedExercise] = useState<{ name: string; uri: string } | null>(null);

  const [originalMedia, setOriginalMedia] = useState<{ url?: string | null; mediaType?: string | null }>({});
  const [originalExercise, setOriginalExercise] = useState<{ url?: string | null; name?: string | null }>({});

  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exerciseUploading, setExerciseUploading] = useState(false);
  const [exerciseProgress, setExerciseProgress] = useState(0);

  const [videoModal, setVideoModal] = useState({ visible: false, url: "" });

  const videoPlayer = useVideoPlayer({ uri: videoModal.url });

  const [audioSound, setAudioSound] = useState<Audio.Sound | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);

  /* ============================
   * AUDIO PLAYER
   * ============================ */
  async function playAudio(uri: string) {
    try {
      if (audioSound) {
        audioSound.unloadAsync();
        setAudioPlaying(false);
      }

      const { sound } = await Audio.Sound.createAsync({ uri });
      setAudioSound(sound);

      await sound.playAsync();
      setAudioPlaying(true);

      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.didJustFinish) setAudioPlaying(false);
      });
    } catch {
      Alert.alert("Cannot play audio");
    }
  }

  async function stopAudio() {
    if (audioSound) {
      await audioSound.stopAsync();
      setAudioPlaying(false);
    }
  }

  /* ============================
   * LOAD DOCUMENT FOR EDITING
   * ============================ */
  useEffect(() => {
    if (!editId) return;

    (async () => {
      try {
        const snap = await getDoc(doc(db, "listens", editId));
        if (!snap.exists()) return router.back();

        const d = snap.data();

        setTitle(d.title || "");
        setTranscript(d.transcript || "");
        setLevel(d.level || "");
        setTopic(d.topic || "");

        setOriginalMedia({ url: d.audioUrl, mediaType: d.mediaType });
        setOriginalExercise({ url: d.exerciseFileUrl, name: d.exerciseFileName });

      } catch {
        Toast.show({ type: "error", text1: "Load failed" });
      } finally {
        setLoadingDoc(false);
      }
    })();
  }, [editId]);

  /* ============================
   * FILE UPLOAD
   * ============================ */
  const uploadToFirebase = async (localUri: string, path: string, onProgress?: any) => {
    const blob = await (await fetch(localUri)).blob();
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, blob);

    return new Promise<string>((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snap) => {
          const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          onProgress?.(pct);
        },
        reject,
        async () => resolve(await getDownloadURL(uploadTask.snapshot.ref))
      );
    });
  };

  /* ============================
   * PICK MEDIA
   * ============================ */
  const pickMedia = async () => {
    const r = await DocumentPicker.getDocumentAsync({
      type: ["audio/*", "video/*"],
      copyToCacheDirectory: true,
    });

    if (!r.canceled) {
      const f = r.assets?.[0];
      if (f?.uri) setPickedMedia({ name: f.name ?? "media", uri: f.uri });
    }
  };

  /* ============================
   * PICK EXERCISE FILE
   * ============================ */
  const pickExercise = async () => {
    const r = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      copyToCacheDirectory: true,
    });

    if (!r.canceled) {
      const f = r.assets?.[0];
      if (!f?.uri) return;

      setExerciseUploading(true);
      setExerciseProgress(0);

      try {
        const ext = f.name.split(".").pop();

        const url = await uploadToFirebase(
          f.uri,
          `listen/files/${slugify(title || "exercise")}_${Date.now()}.${ext}`,
          (p: number) => setExerciseProgress(p)
        );

        setOriginalExercise({ url, name: f.name });
        setPickedExercise(null);

      } catch {
        Toast.show({ type: "error", text1: "Upload failed" });
      } finally {
        setExerciseUploading(false);
      }
    }
  };

  /* ============================
   * OPEN EXERCISE FILE
   * ============================ */
  const openExerciseFile = async () => {
    if (!originalExercise.url)
      return Alert.alert("File not available");

    await WebBrowser.openBrowserAsync(originalExercise.url);
  };

  /* ============================
   * SAVE LESSON
   * ============================ */
  const onSave = async () => {
    Keyboard.dismiss();

    if (!title.trim()) return Alert.alert("Title is required!");
    if (!level) return Alert.alert("Level is required!");
    if (!topic) return Alert.alert("Topic is required!");

    const hasMedia = pickedMedia?.uri || originalMedia.url;
    if (!hasMedia) return Alert.alert("Media is required!");

    setBusy(true);
    setProgress(0);

    try {
      let finalUrl = originalMedia.url;
      let mediaType = originalMedia.mediaType;

      if (pickedMedia?.uri) {
        const ext = pickedMedia.name.split(".").pop();
        finalUrl = await uploadToFirebase(
          pickedMedia.uri,
          `listen/${slugify(title)}_${Date.now()}.${ext}`,
          (p: number) => setProgress(p)
        );
        mediaType = inferMediaType(finalUrl!);
      }

      const payload = {
        title: title.trim(),
        transcript: transcript.trim(),
        level,
        topic,
        audioUrl: finalUrl!,
        mediaType,
        exerciseFileUrl: originalExercise.url || null,
        exerciseFileName: originalExercise.name || null,
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

      Toast.show({ type: "success", text1: "Saved!" });
      router.replace("/(admin)/listen/listen-screen");

    } catch {
      Toast.show({ type: "error", text1: "Save failed" });
    } finally {
      setBusy(false);
    }
  };

  /* ============================
   * RENDER UI
   * ============================ */
  const Form = (
    <>
      {/* HEADER */}
      <View style={CS.header}>
        <View style={CS.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={CS.backBtn}>
            <Ionicons name="arrow-back-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>

          <View>
            <Text style={CS.headerTitle}>
              {editId ? "Edit Listening" : "Create Listening"}
            </Text>
            <Text style={CS.headerSubtitle}>
              {editId ? "Update existing lesson" : "Add a new listening lesson"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={onSave}
          disabled={!title.trim() || !level || !topic || busy}
          style={[
            CS.saveBtn,
            { backgroundColor: title.trim() && level && topic ? COLORS.primary : COLORS.border },
          ]}
        >
          {busy ? (
            <ActivityIndicator size={16} color={COLORS.bg} />
          ) : (
            <>
              <Ionicons name="save-outline" size={18} color={COLORS.bg} />
              <Text style={CS.saveText}>{editId ? "Update" : "Save"}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* BODY */}
      {loadingDoc ? (
        <View style={CS.loadingContainer}>
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView style={CS.scroll} contentContainerStyle={{ paddingBottom: 120 }}>
          
          {/* INFO CARD */}
          <View style={CS.sectionCard}>
            <View style={CS.sectionHeader}>
              <Text style={CS.sectionTitle}>Listening Info</Text>
              <Text style={CS.sectionSubtitle}>Title, level, topic & transcript</Text>
            </View>

            {/* TITLE */}
            <View style={CS.formRow}>
              <Text style={CS.formLabel}>Title *</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Unit 1 — Greetings"
                placeholderTextColor={COLORS.textMuted}
                style={CS.input}
              />
            </View>

            {/* LEVEL + TOPIC */}
            <View style={{ flexDirection: "row", gap: 12, marginTop: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={CS.formLabel}>Level *</Text>
                <Dropdown
                  value={level}
                  onChange={setLevel}
                  placeholder="Choose Level"
                  options={[
                    { label: "A1", value: "A1" },
                    { label: "A2", value: "A2" },
                    { label: "B1", value: "B1" },
                    { label: "B2", value: "B2" },
                    { label: "C1", value: "C1" },
                  ]}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={CS.formLabel}>Topic *</Text>
                <Dropdown
                  value={topic}
                  onChange={setTopic}
                  placeholder="Choose Topic"
                  options={[
                    { label: "Daily Life", value: "Daily Life" },
                    { label: "School", value: "School" },
                    { label: "Career", value: "Career" },
                    { label: "Travel", value: "Travel" },
                    { label: "Family", value: "Family" },
                    { label: "Hobbies", value: "Hobbies" },
                    { label: "Technology", value: "Technology" },
                    { label: "Health", value: "Health" },
                    { label: "Shopping", value: "Shopping" },
                    { label: "Social", value: "Social" },
                  ]}
                />
              </View>
            </View>

            {/* TRANSCRIPT */}
            <View style={CS.formRow}>
              <Text style={CS.formLabel}>Transcript</Text>
              <TextInput
                multiline
                value={transcript}
                onChangeText={setTranscript}
                placeholder="A: Hello! How are you?"
                placeholderTextColor={COLORS.textMuted}
                style={[CS.input, CS.textarea]}
              />
            </View>
          </View>

          {/* MEDIA FILE */}
          <View style={CS.sectionCard}>
            <Text style={CS.sectionTitle}>Media File</Text>
            <Text style={CS.sectionSubtitle}>Audio or Video</Text>

            {/* PREVIEW */}
            {(() => {
              const url = pickedMedia?.uri || originalMedia.url;

              if (!url) return null;

              const isVideo = url.endsWith(".mp4") || url.endsWith(".mov");
              const isAudio = !isVideo;

              if (isVideo) {
                return (
                  <TouchableOpacity
                    onPress={() => setVideoModal({ visible: true, url })}
                    style={CS.videoThumb}
                  >
                    <Ionicons name="play-circle" size={48} color={COLORS.primary} />
                  </TouchableOpacity>
                );
              }

              if (isAudio) {
                return (
                  <View style={CS.audioBar}>
                    <TouchableOpacity onPress={() => (audioPlaying ? stopAudio() : playAudio(url))}>
                      <Ionicons
                        name={audioPlaying ? "pause-circle" : "play-circle"}
                        size={40}
                        color={COLORS.primary}
                      />
                    </TouchableOpacity>

                    <Text style={CS.audioText}>
                      {pickedMedia?.name || url.split("/").pop()}
                    </Text>
                  </View>
                );
              }

              return null;
            })()}

            {/* ACTIONS */}
            <View style={CS.mediaActionRow}>
              {(pickedMedia || originalMedia.url) && (
                <TouchableOpacity
                  style={CS.actionBtnRow}
                  onPress={() => {
                    setPickedMedia(null);
                    setOriginalMedia({ url: null, mediaType: null });
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color="#d11a2a" />
                  <Text style={CS.actionRemoveText}>Remove</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={CS.actionBtnRow} onPress={pickMedia}>
                <Ionicons name="cloud-upload-outline" size={20} color={COLORS.primary} />
                <Text style={CS.actionChangeText}>
                  {pickedMedia || originalMedia.url ? "Change" : "Upload"}
                </Text>
              </TouchableOpacity>

              {pickedMedia && (
                <Text style={CS.progressText}>
                  Uploading {progress}%
                </Text>
              )}
            </View>
          </View>

          {/* EXERCISE FILE */}
          <View style={CS.sectionCard}>
            <Text style={CS.sectionTitle}>Exercise File (Optional)</Text>
            <Text style={CS.sectionSubtitle}>PDF / Word</Text>

            {(originalExercise.url || pickedExercise) && (
              <View style={CS.exercisePreview}>
                <Ionicons name="document-text-outline" size={22} color={COLORS.text} />
                <Text style={CS.fileName}>
                  {pickedExercise?.name || originalExercise.name}
                </Text>
              </View>
            )}

            {/* ACTIONS */}
            <View style={CS.exerciseActionRow}>
              {originalExercise.url && (
                <TouchableOpacity
                  style={CS.actionBtnRow}
                  onPress={() => {
                    setOriginalExercise({ url: null, name: null });
                    setPickedExercise(null);
                  }}
                >
                  <Ionicons name="close-circle" size={20} color="#d11a2a" />
                  <Text style={CS.actionRemoveText}>Remove</Text>
                </TouchableOpacity>
              )}

              {originalExercise.url && (
                <TouchableOpacity style={CS.actionBtnRow} onPress={openExerciseFile}>
                  <Ionicons name="document-text-outline" size={18} color={COLORS.primary} />
                  <Text style={CS.actionChangeText}>Open</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={CS.actionBtnRow} onPress={pickExercise}>
                <Ionicons name="cloud-upload-outline" size={20} color={COLORS.primary} />
                <Text style={CS.actionChangeText}>
                  {originalExercise.url ? "Change" : "Upload"}
                </Text>
              </TouchableOpacity>

              {exerciseUploading && (
                <Text style={CS.progressText}>Uploading {exerciseProgress}%</Text>
              )}
            </View>

          </View>
        </ScrollView>
      )}

      {/* VIDEO MODAL */}
      <Modal visible={videoModal.visible} transparent animationType="fade">
        <View style={CS.videoModalOverlay}>
          <TouchableOpacity
            style={CS.videoModalClose}
            onPress={() => setVideoModal({ visible: false, url: "" })}
          >
            <Ionicons name="close" size={30} color={COLORS.bg} />
          </TouchableOpacity>

          <View style={CS.videoModalBox}>
            <VideoView player={videoPlayer} style={CS.videoModalPlayer} contentFit="contain" />
          </View>
        </View>
      </Modal>
    </>
  );

  /* ============================
   * WEB WRAPPER
   * ============================ */
  if (Platform.OS === "web") {
    return (
      <View style={[CS.container, { paddingTop: insets.top }]}>
        {Form}
      </View>
    );
  }

  /* ============================
   * MOBILE WRAPPER
   * ============================ */
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[CS.container, { paddingTop: insets.top }]}>
          {Form}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
