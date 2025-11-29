// app/(tabs)/listen/[id].tsx
import { ItemStyles as ST } from '@/components/style/user/listen/ItemStyles';
import { db } from '@/scripts/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  LayoutAnimation,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/* expo-video */
import { VideoView, useVideoPlayer } from 'expo-video';

/* -------------------- TYPES -------------------- */
type Question = {
  id: string;
  kind: 'mcq' | 'fill' | 'dictation' | 'listen_segment';
  prompt: string;
  answer?: string;
  options?: string[];
  startSec?: number;
  endSec?: number;
};

type ListenDoc = {
  title: string;
  transcript: string;
  audioUrl?: string;
  mediaType?: string;
  level?: string;
};

/* -------------------- HELPERS -------------------- */
const isHls = (u: string) => u?.toLowerCase().endsWith('.m3u8');
const isVideoByExt = (u: string) =>
  u?.toLowerCase().endsWith('.mp4') ||
  u?.toLowerCase().endsWith('.m4v') ||
  isHls(u);

/* -------------------- MAIN -------------------- */
export default function ListenItemScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [data, setData] = useState<ListenDoc | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  /* STATE LƯU ĐÁP ÁN USER */
  const [picked, setPicked] = useState<Record<string, number | null>>({});
  const [checked, setChecked] = useState<Record<string, boolean | null>>({});

  /* -------------------- LOAD LESSON + QUESTIONS -------------------- */
  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoading(true);

      const snap = await getDoc(doc(db, 'listens', id));
      setData(snap.exists() ? (snap.data() as ListenDoc) : null);

      const list: Question[] = [];
      const qSnap = await getDocs(collection(db, 'listens', id, 'questions'));
      qSnap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));

      setQuestions(list);

      // init state
      const initPick: any = {};
      const initCheck: any = {};
      list.forEach((q) => {
        initPick[q.id] = null;
        initCheck[q.id] = null;
      });
      setPicked(initPick);
      setChecked(initCheck);

      setLoading(false);
    })();
  }, [id]);

  /* -------------------- MEDIA PLAYER -------------------- */
  const uri = data?.audioUrl || '';
  const mediaType = data?.mediaType?.toLowerCase() || '';

  const isVideo = useMemo(() => {
    if (!uri) return false;
    return mediaType.startsWith('video') || isVideoByExt(uri);
  }, [mediaType, uri]);

  const player = useVideoPlayer('' as any, (p) => {
    p.loop = false;
  });

  useEffect(() => {
    if (uri) player.replace(uri);
  }, [uri]);

  /* -------------------- TRANSCRIPT -------------------- */
  const [openTran, setOpenTran] = useState(false);

  const toggleTranscript = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenTran((v) => !v);
  };

  /* -------------------- PLAY SEGMENT -------------------- */
  const playSegment = (q: Question) => {
    if (q.startSec == null) return;

    player.currentTime = q.startSec ?? 0;
    player.play();

    if (q.endSec != null) {
      const dur = (q.endSec - q.startSec) * 1000;
      setTimeout(() => player.pause(), dur);
    }
  };

  /* -------------------- SUBMIT ANSWER -------------------- */
  const submitAnswer = (q: Question) => {
    if (!q.options || !q.answer) return;
    if (picked[q.id] === null) return;

    const idx = picked[q.id]!;
    const ok = q.options[idx] === q.answer;

    setChecked((prev) => ({ ...prev, [q.id]: ok }));
  };

  /* -------------------- UI -------------------- */
  if (loading) {
    return (
      <SafeAreaView style={ST.loadingWrap}>
        <ActivityIndicator color="#60a5fa" />
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={ST.loadingWrap}>
        <Text style={{ color: '#fff' }}>Không tìm thấy bài nghe.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={ST.safeWrapDark}>
      {/* Header */}
      <View style={ST.header}>
        <TouchableOpacity onPress={() => router.back()} style={ST.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#e5e7eb" />
        </TouchableOpacity>

        <Text numberOfLines={1} style={[ST.title, ST.headerTitleText]}>
          {data.title}
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={ST.scrollContent}>
        {/* MEDIA */}
        {uri ? (
          <View style={ST.mediaCard}>
            <View style={ST.mediaCardHeader}>
              <Ionicons
                name={isVideo ? 'videocam' : 'musical-notes'}
                size={18}
                color="#93c5fd"
              />
              <Text style={ST.mediaCardHeaderText}>
                {isVideo ? 'Video' : 'Audio'} Player
              </Text>
            </View>

            <View style={isVideo ? ST.mediaPlayerVideo : ST.mediaPlayerAudio}>
              <VideoView
                player={player}
                style={ST.videoView}
                contentFit="contain"
                nativeControls
              />
            </View>
          </View>
        ) : (
          <View style={ST.noMediaCard}>
            <Text style={ST.noMediaText}>Không có media.</Text>
          </View>
        )}

        {/* TRANSCRIPT */}
        {!!data.transcript && (
          <View style={ST.transcriptCard}>
            <View style={ST.transcriptHeader}>
              <Text style={ST.transcriptHeaderTitle}>Transcript</Text>

              <TouchableOpacity
                onPress={toggleTranscript}
                style={ST.transcriptToggleBtn}
              >
                <Ionicons
                  name={openTran ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#d1d5db"
                />
              </TouchableOpacity>
            </View>

            <Text
              selectable
              numberOfLines={openTran ? undefined : 5}
              style={ST.transcriptText}
            >
              {data.transcript}
            </Text>
          </View>
        )}
{/* QUESTIONS */}
<View style={ST.quizCard}>
  <Text style={ST.quizHeaderTitle}>Câu hỏi</Text>

  {questions.map((q, i) => {
    const sel = picked[q.id];
    const result = checked[q.id];

    return (
      <View key={q.id} style={ST.quizItem}>

        {/* ===== TITLE + PLAY SEGMENT ===== */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={ST.quizItemTitle}>Câu {i + 1}</Text>

          {q.startSec != null && (
            <TouchableOpacity
              onPress={() => playSegment(q)}
            >
              <Text style={ST.quizSegmentText}>
                ▶ {q.startSec}s → {q.endSec ?? '...'}s
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ===== PROMPT ===== */}
        <Text style={ST.quizItemText}>{q.prompt}</Text>

        {/* ===== MULTIPLE CHOICE ===== */}
        {q.kind === 'mcq' && (
          <View style={{ marginTop: 10 }}>
            {q.options?.map((op, idx) => {
              const isActive = sel === idx;
              const isCorrect = result === true && op === q.answer;
              const isWrong = result === false && isActive;

              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() =>
                    setPicked(prev => ({ ...prev, [q.id]: idx }))
                  }
                  style={[
                    ST.choiceBtn,
                    isActive && ST.choiceSelected,
                    isCorrect && ST.choiceCorrect,
                    isWrong && ST.choiceWrong,
                  ]}
                >
                  <Text style={ST.choiceText}>
                    {String.fromCharCode(65 + idx)}. {op}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Nút xác nhận */}
            <TouchableOpacity onPress={() => submitAnswer(q)} style={ST.checkBtn}>
              <Text style={ST.checkBtnText}>Xác nhận</Text>
            </TouchableOpacity>

            {/* Kết quả */}
            {result != null && (
              <Text
                style={[
                  ST.quizResult,
                  result ? ST.quizResultCorrect : ST.quizResultWrong,
                ]}
              >
                {result
                  ? '🎉 Chính xác!'
                  : `❌ Sai rồi. Đáp án đúng: ${q.answer}`}
              </Text>
            )}
          </View>
        )}

        {/* ===== LISTEN ONLY (KHÔNG MCQ) ===== */}
        {q.kind === 'listen_segment' && (
          <TouchableOpacity
            style={[ST.choiceBtn, { marginTop: 14 }]}
            onPress={() => playSegment(q)}
          >
            <Text style={ST.choiceText}>
              ▶ Nghe đoạn {q.startSec}s → {q.endSec}s
            </Text>
          </TouchableOpacity>
        )}

      </View>
    );
  })}

  {questions.length === 0 && (
    <Text style={{ color: '#aaa', marginTop: 10 }}>
      Chưa có câu hỏi nào.
    </Text>
  )}
</View>

      </ScrollView>
    </SafeAreaView>
  );
}
