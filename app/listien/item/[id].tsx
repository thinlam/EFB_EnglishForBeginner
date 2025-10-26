// app/listen/item/[id].tsx
import { ListenStyles as S } from '@/components/style/tabs/ListenStyles';
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

  const player = useVideoPlayer(undefined, p => {
    p.loop = false;
  });

  useEffect(() => {
    if (uri) player.replace(uri);
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
    <SafeAreaView style={[S.wrap, { backgroundColor: '#0b1220' }]}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 6,
          paddingBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={[S.iconBtn, { backgroundColor: '#11182733' }]}>
          <Ionicons name="arrow-back" size={22} color="#e5e7eb" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={[S.title, { color: '#e5e7eb' }]}>
            {data?.title || 'Listen'}
          </Text>
          {!!data?.level || !!data?.durationSec ? (
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
              {!!data?.level && (
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                    backgroundColor: '#60a5fa22',
                    borderWidth: 1,
                    borderColor: '#60a5fa55',
                  }}
                >
                  <Text style={{ color: '#93c5fd', fontSize: 12, fontWeight: '600' }}>{data.level}</Text>
                </View>
              )}
              {!!data?.durationSec && (
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                    backgroundColor: '#22c55e22',
                    borderWidth: 1,
                    borderColor: '#22c55e55',
                  }}
                >
                  <Text style={{ color: '#86efac', fontSize: 12, fontWeight: '600' }}>
                    {fmtDuration(data.durationSec)}
                  </Text>
                </View>
              )}
              {isHls(uri) && (
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                    backgroundColor: '#f59e0b22',
                    borderWidth: 1,
                    borderColor: '#f59e0b55',
                  }}
                >
                  <Text style={{ color: '#fcd34d', fontSize: 12, fontWeight: '600' }}>HLS</Text>
                </View>
              )}
            </View>
          ) : null}
        </View>
        <View style={{ width: 32, height: 32 }} />
      </View>

      {/* Loading / Error / Empty */}
      {loading ? (
        <View style={{ padding: 24 }}>
          <ActivityIndicator color="#93c5fd" />
        </View>
      ) : fetchErr ? (
        <View style={{ padding: 20 }}>
          <Text style={{ color: '#fca5a5', fontWeight: '600', marginBottom: 8 }}>Không tải được dữ liệu</Text>
          <Text style={{ color: '#fca5a5aa', marginBottom: 12, fontSize: 12 }}>{fetchErr}</Text>
          <TouchableOpacity
            onPress={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 150);
            }}
            style={{
              alignSelf: 'flex-start',
              backgroundColor: '#ef4444',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : !data ? (
        <View style={{ padding: 24 }}>
          <Text style={{ color: '#e5e7eb' }}>Không tìm thấy bài.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* MEDIA CARD */}
          {uri ? (
            <View
              style={{
                width: '100%',
                backgroundColor: '#0f172a',
                borderRadius: 16,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: '#1f2937',
              }}
            >
              <View
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Ionicons
                  name={isVideo ? 'videocam' : 'musical-notes'}
                  size={18}
                  color="#93c5fd"
                />
                <Text style={{ color: '#cbd5e1', fontWeight: '600' }}>
                  {isVideo ? 'Video' : 'Audio'} player
                </Text>
              </View>

              <View
                style={{
                  width: '100%',
                  aspectRatio: isVideo ? 16 / 9 : undefined,
                  height: isVideo ? undefined : 64,
                  backgroundColor: '#000',
                }}
              >
                <VideoView
                  player={player}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="contain"
                  nativeControls
                  allowsFullscreen
                  allowsPictureInPicture
                />
              </View>
            </View>
          ) : (
            <View
              style={{
                padding: 16,
                backgroundColor: '#0f172a',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: '#1f2937',
              }}
            >
              <Text style={{ color: '#94a3b8' }}>Chưa có media cho bài này.</Text>
            </View>
          )}

          {/* TRANSCRIPT */}
          {!!data.transcript && (
            <View
              style={{
                backgroundColor: '#0f172a',
                borderRadius: 16,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: '#1f2937',
              }}
            >
              <View
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="document-text" size={18} color="#a5b4fc" />
                  <Text style={{ color: '#cbd5e1', fontWeight: '700' }}>Transcript</Text>
                </View>

                <TouchableOpacity
                  onPress={onToggleTranscript}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    backgroundColor: '#111827',
                    borderRadius: 999,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Ionicons
                    name={showFullTranscript ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color="#d1d5db"
                  />
                  <Text style={{ color: '#d1d5db', fontSize: 12, fontWeight: '600' }}>
                    {showFullTranscript ? 'Thu gọn' : 'Xem thêm'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                <Text
                  selectable
                  style={{
                    color: '#e5e7eb',
                    lineHeight: 22,
                    opacity: 0.95,
                  }}
                  numberOfLines={showFullTranscript ? undefined : 6}
                >
                  {data.transcript}
                </Text>
              </View>
            </View>
          )}

          {/* MINI QUIZ */}
          {!!data?.payload && choices.length > 0 && (
            <View
              style={{
                backgroundColor: '#0f172a',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: '#1f2937',
                overflow: 'hidden',
              }}
            >
              <View style={{ paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="help-circle" size={18} color="#60a5fa" />
                <Text style={{ color: '#cbd5e1', fontWeight: '700' }}>Mini-quiz</Text>
              </View>

              <View style={{ padding: 16, gap: 12 }}>
                <Text style={{ color: '#e5e7eb' }}>{data.payload.sentence}</Text>

                {choices.map((ch, i) => {
                  const isPicked = picked === i;
                  const bg =
                    isPicked && checked === 'correct' ? '#065f46' :
                    isPicked && checked === 'wrong' ? '#7f1d1d' :
                    '#111827';

                  const border =
                    isPicked && checked === 'correct' ? '#10b98155' :
                    isPicked && checked === 'wrong' ? '#ef444455' :
                    '#374151';

                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => onPick(i)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        borderRadius: 12,
                        backgroundColor: bg,
                        borderWidth: 1,
                        borderColor: border,
                      }}
                    >
                      <Text style={{ color: '#e5e7eb' }}>
                        {String.fromCharCode(65 + i)}. {ch}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                {checked && (
                  <Text
                    style={{
                      marginTop: 4,
                      color: checked === 'correct' ? '#86efac' : '#fca5a5',
                      fontWeight: '700',
                    }}
                  >
                    {checked === 'correct' ? '✅ Correct!' : `❌ Wrong. Answer: ${data.payload.answer}`}
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
