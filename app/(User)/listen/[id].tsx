// app/(User)/listen/[id].tsx
import { ItemStyles as ST } from '@/components/style/user/listen/ItemStyles';
import { db } from '@/scripts/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  LayoutAnimation,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/* expo-video */
import { VideoView, useVideoPlayer } from 'expo-video';

/* -------------------- TYPES -------------------- */
type QuizPayload = {
  sentence: string;
  choices: string[] | Record<string, string>;
  answer: string;
};

type ListenDoc = {
  title: string;
  transcript: string;
  audioUrl?: string | null;
  mediaType?: string | null;
  level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  durationSec?: number;
  payload?: QuizPayload;
};

/* -------------------- HELPERS -------------------- */
const isHls = (u: string) => u.toLowerCase().endsWith('.m3u8');

const isVideoByExt = (u: string) => {
  const l = u.toLowerCase();
  return l.endsWith('.mp4') || l.endsWith('.m4v') || isHls(l);
};

const fmtDuration = (sec?: number) => {
  if (!sec || sec <= 0) return '';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
};

const normalizeChoices = (c?: QuizPayload['choices']) => {
  if (!c) return [];
  return Array.isArray(c) ? c : Object.values(c);
};

/* -------------------- MAIN -------------------- */
export default function ListenItemScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [data, setData] = useState<ListenDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState<string | null>(null);

  // Fetch Firestore document
  useEffect(() => {
    (async () => {
      if (!id) return;
      setLoading(true);
      setFetchErr(null);
      try {
        const snap = await getDoc(doc(db, 'listens', id));
        if (snap.exists()) {
          const snapData = snap.data();
          const merged = {
            ...snapData,
            payload: snapData.payload ?? snapData.bayload, // hỗ trợ luôn cả "bayload"
          } as ListenDoc;
          setData(merged);
        } else {
          setData(null);
        }
      } catch (e: any) {
        setFetchErr(e?.message ?? 'Fetch failed');
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  /* -------------------- MEDIA PLAYER -------------------- */
  const uri = (data?.audioUrl ?? '').trim();
  const mediaType = (data?.mediaType ?? '').toLowerCase();

  const isVideo = useMemo(() => {
    if (!uri) return false;
    return (
      mediaType.startsWith('video/') ||
      mediaType === 'application/x-mpegurl' ||
      isVideoByExt(uri)
    );
  }, [mediaType, uri]);

  // FIX: không dùng undefined, dùng '' as any cho TS
  const player = useVideoPlayer('' as any, p => {
    p.loop = false;
  });

  useEffect(() => {
    if (uri) {
      player.replace(uri);
    }
  }, [uri, player]);

  /* -------------------- TRANSCRIPT -------------------- */
  const [showFullTranscript, setShowFullTranscript] = useState(false);
  const onToggleTranscript = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFullTranscript(v => !v);
  };

  /* -------------------- MINI QUIZ -------------------- */
  const choices = normalizeChoices(data?.payload?.choices);
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState<null | 'correct' | 'wrong'>(null);

  const onPick = (i: number) => {
    if (!data?.payload) return;
    setPicked(i);
    const ok = normalizeChoices(data.payload.choices)[i] === data.payload.answer;
    setChecked(ok ? 'correct' : 'wrong');
  };

  /* -------------------- UI -------------------- */
  return (
    <SafeAreaView style={ST.safeWrapDark}>
      {/* Header */}
      <View style={ST.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[ST.iconBtn, ST.backBtnDark]}
        >
          <Ionicons name="arrow-back" size={22} color="#e5e7eb" />
        </TouchableOpacity>

        <View style={ST.headerTitleContainer}>
          <Text numberOfLines={1} style={[ST.title, ST.headerTitleText]}>
            {data?.title || 'Listen'}
          </Text>

          {!!data?.level || !!data?.durationSec ? (
            <View style={ST.pillRow}>
              {!!data?.level && (
                <View style={[ST.pillBase, ST.pillLevel]}>
                  <Text style={ST.pillLevelText}>{data.level}</Text>
                </View>
              )}

              {!!data?.durationSec && (
                <View style={[ST.pillBase, ST.pillDuration]}>
                  <Text style={ST.pillDurationText}>
                    {fmtDuration(data.durationSec)}
                  </Text>
                </View>
              )}

              {isHls(uri) && (
                <View style={[ST.pillBase, ST.pillHls]}>
                  <Text style={ST.pillHlsText}>HLS</Text>
                </View>
              )}
            </View>
          ) : null}
        </View>

        <View style={ST.headerRightPlaceholder} />
      </View>

      {/* Loading / Error / Empty */}
      {loading ? (
        <View style={ST.loadingWrap}>
          <ActivityIndicator color="#93c5fd" />
        </View>
      ) : fetchErr ? (
        <View style={ST.errorWrap}>
          <Text style={ST.errorTitle}>Không tải được dữ liệu</Text>
          <Text style={ST.errorMessage}>{fetchErr}</Text>
          <TouchableOpacity
            onPress={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 150);
            }}
            style={ST.errorRetryBtn}
          >
            <Text style={ST.errorRetryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : !data ? (
        <View style={ST.emptyWrap}>
          <Text style={ST.emptyText}>Không tìm thấy bài.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={ST.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* MEDIA CARD */}
          {uri ? (
            <View style={ST.mediaCard}>
              <View style={ST.mediaCardHeader}>
                <Ionicons
                  name={isVideo ? 'videocam' : 'musical-notes'}
                  size={18}
                  color="#93c5fd"
                />
                <Text style={ST.mediaCardHeaderText}>
                  {isVideo ? 'Video' : 'Audio'} player
                </Text>
              </View>

              <View style={isVideo ? ST.mediaPlayerVideo : ST.mediaPlayerAudio}>
                <VideoView
                  player={player}
                  style={ST.videoView}
                  contentFit="contain"
                  nativeControls
                  allowsFullscreen
                  allowsPictureInPicture
                />
              </View>
            </View>
          ) : (
            <View style={ST.noMediaCard}>
              <Text style={ST.noMediaText}>Chưa có media cho bài này.</Text>
            </View>
          )}

          {/* TRANSCRIPT */}
          {!!data.transcript && (
            <View style={ST.transcriptCard}>
              <View style={ST.transcriptHeader}>
                <View style={ST.transcriptHeaderLeft}>
                  <Ionicons name="document-text" size={18} color="#a5b4fc" />
                  <Text style={ST.transcriptHeaderTitle}>Transcript</Text>
                </View>

                <TouchableOpacity
                  onPress={onToggleTranscript}
                  style={ST.transcriptToggleBtn}
                >
                  <Ionicons
                    name={showFullTranscript ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color="#d1d5db"
                  />
                  <Text style={ST.transcriptToggleText}>
                    {showFullTranscript ? 'Thu gọn' : 'Xem thêm'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={ST.transcriptBody}>
                <Text
                  selectable
                  style={ST.transcriptText}
                  numberOfLines={showFullTranscript ? undefined : 6}
                >
                  {data.transcript}
                </Text>
              </View>
            </View>
          )}

          {/* MINI QUIZ */}
          {!!data?.payload && choices.length > 0 && (
            <View style={ST.quizCard}>
              <View style={ST.quizHeader}>
                <Ionicons name="help-circle" size={18} color="#60a5fa" />
                <Text style={ST.quizHeaderTitle}>Mini-quiz</Text>
              </View>

              <View style={ST.quizBody}>
                <Text style={ST.quizSentence}>{data.payload.sentence}</Text>

                {choices.map((ch, i) => {
                  const isPicked = picked === i;

                  const choiceStyle = [
                    ST.choiceBtn,
                    isPicked && checked === 'correct' && ST.choiceBtnCorrect,
                    isPicked && checked === 'wrong' && ST.choiceBtnWrong,
                  ];

                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => onPick(i)}
                      style={choiceStyle}
                    >
                      <Text style={ST.choiceText}>
                        {String.fromCharCode(65 + i)}. {ch}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                {checked && (
                  <Text
                    style={[
                      ST.quizResult,
                      checked === 'correct'
                        ? ST.quizResultCorrect
                        : ST.quizResultWrong,
                    ]}
                  >
                    {checked === 'correct'
                      ? '✅ Correct!'
                      : `❌ Wrong. Answer: ${data.payload.answer}`}
                  </Text>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
