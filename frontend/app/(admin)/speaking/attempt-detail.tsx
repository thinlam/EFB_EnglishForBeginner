// app/(admin)/speaking/attempt-detail.tsx
import { COLORS } from '@/components/style/colors/AppColors';
import { auth, db } from '@/scripts/firebase';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Timestamp,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
type AttemptStatus = 'pending' | 'reviewed';

type SpeakingAttempt = {
  id: string;
  userId: string;
  lessonId: string;
  durationSec?: number;
  fileUrl?: string;
  level?: CEFR | null;
  status?: AttemptStatus;
  teacherScore?: number | null;
  teacherBand?: string | null;
  teacherComment?: string | null;
  createdAt?: Date | null;
};

type SpeakingLesson = {
  id: string;
  title: string;
  prompt?: string;
  sampleAnswer?: string;
  level?: CEFR;
  topic?: string;
  type?: string;
};

function formatSeconds(sec?: number) {
  if (!sec && sec !== 0) return '—';
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(r).padStart(2, '0');
  return `${mm}:${ss}`;
}

function formatDateTime(d?: Date | null) {
  if (!d) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}

export default function SpeakingAttemptDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [attempt, setAttempt] = useState<SpeakingAttempt | null>(null);
  const [lesson, setLesson] = useState<SpeakingLesson | null>(null);

  const [score, setScore] = useState<string>('');
  const [bandComment, setBandComment] = useState<string>('');
  const [teacherComment, setTeacherComment] = useState<string>('');

  // audio
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        // load attempt
        const aSnap = await getDoc(doc(db, 'speaking_attempts', id));
        if (!aSnap.exists()) {
          Alert.alert('Không tìm thấy bài nói này');
          router.back();
          return;
        }
        const raw = aSnap.data() as any;
        const a: SpeakingAttempt = {
          id: aSnap.id,
          userId: raw.userId ?? '',
          lessonId: raw.lessonId ?? '',
          durationSec:
            typeof raw.durationSec === 'number' ? raw.durationSec : undefined,
          fileUrl: raw.fileUrl ?? '',
          level: (raw.level as CEFR) ?? null,
          status: (raw.status as AttemptStatus) ?? 'pending',
          teacherScore:
            typeof raw.teacherScore === 'number' ? raw.teacherScore : null,
          teacherBand: raw.teacherBand ?? null,
          teacherComment: raw.teacherComment ?? null,
          createdAt:
            raw.createdAt instanceof Timestamp ? raw.createdAt.toDate() : null,
        };
        setAttempt(a);

        setScore(
          typeof a.teacherScore === 'number' ? String(a.teacherScore) : ''
        );
        setBandComment(a.teacherBand ?? '');
        setTeacherComment(a.teacherComment ?? '');

        // load lesson
        if (a.lessonId) {
          const lSnap = await getDoc(doc(db, 'speaking_lessons', a.lessonId));
          if (lSnap.exists()) {
            const lr = lSnap.data() as any;
            const l: SpeakingLesson = {
              id: lSnap.id,
              title: lr.title ?? '(No title)',
              prompt: lr.prompt ?? '',
              sampleAnswer: lr.sampleAnswer ?? '',
              level: (lr.level as CEFR) ?? undefined,
              topic: lr.topic ?? '',
              type: lr.type ?? '',
            };
            setLesson(l);
          }
        }
      } catch (e) {
        console.log(e);
        Alert.alert('Lỗi', 'Không tải được dữ liệu bài nói');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // cleanup audio
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    };
  }, []);

  const ensureSoundLoaded = async () => {
    if (!attempt?.fileUrl) {
      Alert.alert('Không có file ghi âm để phát');
      return;
    }
    if (soundRef.current) return;

    const sound = new Audio.Sound();
    await sound.loadAsync({ uri: attempt.fileUrl }, {}, true);
    sound.setOnPlaybackStatusUpdate((status) => {
      if (!status.isLoaded) return;
      if (status.didJustFinish) {
        setIsPlaying(false);
      }
    });
    soundRef.current = sound;
  };

  const handleTogglePlay = async () => {
    try {
      if (!isPlaying) {
        await ensureSoundLoaded();
        if (!soundRef.current) return;
        await soundRef.current.playAsync();
        setIsPlaying(true);
      } else {
        if (!soundRef.current) return;
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      }
    } catch (e) {
      console.log(e);
      Alert.alert('Không phát được audio');
    }
  };

  const handleOpenInBrowser = async () => {
    if (!attempt?.fileUrl) return;
    try {
      const url = attempt.fileUrl;
      const can = await Linking.canOpenURL(url);
      if (can) await Linking.openURL(url);
      else Alert.alert('Không mở được link audio');
    } catch (e) {
      console.log(e);
      Alert.alert('Không mở được link audio');
    }
  };

  const handleSave = async () => {
    if (!attempt) return;
    const trimmedComment = teacherComment.trim();
    const trimmedBand = bandComment.trim();

    let scoreNum: number | null = null;
    if (score.trim()) {
      const n = Number(score.replace(',', '.'));
      if (Number.isNaN(n) || n < 0 || n > 9) {
        Alert.alert('Điểm không hợp lệ', 'Vui lòng nhập từ 0 đến 9 (có thể có .5).');
        return;
      }
      scoreNum = n;
    }

    setSaving(true);
    try {
      const reviewer = auth.currentUser;
      await updateDoc(doc(db, 'speaking_attempts', attempt.id), {
        teacherScore: scoreNum,
        teacherBand: trimmedBand || null,
        teacherComment: trimmedComment || null,
        status: 'reviewed',
        reviewerId: reviewer?.uid ?? null,
        reviewedAt: serverTimestamp(),
      });

      setAttempt((prev) =>
        prev
          ? {
              ...prev,
              teacherScore: scoreNum,
              teacherBand: trimmedBand || null,
              teacherComment: trimmedComment || null,
              status: 'reviewed',
            }
          : prev
      );

      Alert.alert('Đã lưu chấm điểm', 'Kết quả chấm bài đã được cập nhật.');
    } catch (e) {
      console.log(e);
      Alert.alert('Lỗi', 'Không lưu được kết quả chấm bài');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !attempt) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: COLORS.bg }}
        edges={['top', 'left', 'right']}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingTop: 4,
            paddingBottom: 10,
          }}
        >
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <Ionicons name="arrow-back-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <Text
            style={{
              color: COLORS.text,
              fontSize: 18,
              fontWeight: '600',
              marginLeft: 8,
            }}
          >
            Chấm Speaking
          </Text>
        </View>
        <ActivityIndicator style={{ marginTop: 32 }} color={COLORS.create} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      edges={['top', 'left', 'right']}
    >
      {/* HEADER */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingTop: 4,
          paddingBottom: 10,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text
          style={{
            color: COLORS.text,
            fontSize: 18,
            fontWeight: '600',
            marginLeft: 8,
            flex: 1,
          }}
          numberOfLines={1}
        >
          Chấm Speaking
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
      >
        {/* Thông tin bài + học viên */}
        <View
          style={{
            padding: 12,
            borderRadius: 14,
            backgroundColor: COLORS.card,
            borderWidth: 1,
            borderColor: COLORS.borderSoft,
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              color: COLORS.text,
              fontSize: 15,
              fontWeight: '700',
              marginBottom: 4,
            }}
          >
            {lesson?.title ?? '(No title)'}
          </Text>

          <View style={{ flexDirection: 'row', marginBottom: 4 }}>
            <Text style={{ color: COLORS.subText, fontSize: 12 }}>
              Học viên:{' '}
              <Text style={{ fontWeight: '600' }}>{attempt.userId}</Text>
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 4,
              flexWrap: 'wrap',
            }}
          >
            <Text style={{ color: COLORS.subText, fontSize: 12 }}>
              Level: {attempt.level ?? lesson?.level ?? '—'}
            </Text>
            {!!lesson?.topic && (
              <Text style={{ color: COLORS.subText, fontSize: 12 }}>
                {'  •  '}
                {lesson.topic} {lesson.type ? `• ${lesson.type}` : ''}
              </Text>
            )}
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 2,
            }}
          >
            <Ionicons
              name="timer-outline"
              size={14}
              color={COLORS.subText}
            />
            <Text
              style={{ color: COLORS.subText, fontSize: 12, marginLeft: 4 }}
            >
              Thời lượng: {formatSeconds(attempt.durationSec)}
            </Text>
          </View>

          {attempt.createdAt && (
            <Text
              style={{
                color: COLORS.muted,
                fontSize: 11,
                marginTop: 2,
              }}
            >
              Gửi lúc: {formatDateTime(attempt.createdAt)}
            </Text>
          )}
        </View>

        {/* Prompt + sample */}
        {!!lesson?.prompt && (
          <View
            style={{
              padding: 12,
              borderRadius: 14,
              backgroundColor: COLORS.card,
              borderWidth: 1,
              borderColor: COLORS.borderSoft,
              marginBottom: 10,
            }}
          >
            <Text
              style={{
                color: COLORS.text,
                fontSize: 14,
                fontWeight: '700',
                marginBottom: 4,
              }}
            >
              Đề bài
            </Text>
            <Text
              style={{
                color: COLORS.subText,
                fontSize: 13,
                lineHeight: 20,
              }}
            >
              {lesson.prompt}
            </Text>
          </View>
        )}

        {!!lesson?.sampleAnswer && (
          <View
            style={{
              padding: 12,
              borderRadius: 14,
              backgroundColor: COLORS.card,
              borderWidth: 1,
              borderColor: COLORS.borderSoft,
              marginBottom: 10,
            }}
          >
            <Text
              style={{
                color: COLORS.text,
                fontSize: 14,
                fontWeight: '700',
                marginBottom: 4,
              }}
            >
              Sample answer (tham khảo)
            </Text>
            <Text
              style={{
                color: COLORS.subText,
                fontSize: 13,
                lineHeight: 20,
              }}
            >
              {lesson.sampleAnswer}
            </Text>
          </View>
        )}

        {/* Audio control */}
        <View
          style={{
            padding: 12,
            borderRadius: 14,
            backgroundColor: COLORS.card,
            borderWidth: 1,
            borderColor: COLORS.borderSoft,
            marginBottom: 12,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: COLORS.text,
              fontSize: 14,
              fontWeight: '700',
              marginBottom: 6,
            }}
          >
            Bài nói của học viên
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleTogglePlay}
            disabled={!attempt.fileUrl}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 18,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: attempt.fileUrl ? COLORS.create : COLORS.card2,
              opacity: attempt.fileUrl ? 1 : 0.6,
              marginBottom: 6,
            }}
          >
            <Ionicons
              name={isPlaying ? 'pause-circle-outline' : 'play-circle-outline'}
              size={22}
              color={COLORS.bg}
            />
            <Text
              style={{
                color: COLORS.bg,
                fontSize: 14,
                fontWeight: '600',
                marginLeft: 6,
              }}
            >
              {isPlaying ? 'Tạm dừng' : 'Nghe bài nói'}
            </Text>
          </TouchableOpacity>

          {!!attempt.fileUrl && (
            <TouchableOpacity
              onPress={handleOpenInBrowser}
              activeOpacity={0.8}
              style={{ marginTop: 2 }}
            >
              <Text
                style={{
                  color: COLORS.link,
                  fontSize: 12,
                  textDecorationLine: 'underline',
                }}
              >
                Mở file trong trình duyệt
              </Text>
            </TouchableOpacity>
          )}

          {!attempt.fileUrl && (
            <Text
              style={{
                color: COLORS.muted,
                fontSize: 12,
                marginTop: 4,
                textAlign: 'center',
              }}
            >
              Bài nói chưa có file ghi âm (client chưa upload).
            </Text>
          )}
        </View>

        {/* Form chấm điểm */}
        <View
          style={{
            padding: 12,
            borderRadius: 14,
            backgroundColor: COLORS.card,
            borderWidth: 1,
            borderColor: COLORS.borderSoft,
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              color: COLORS.text,
              fontSize: 14,
              fontWeight: '700',
              marginBottom: 8,
            }}
          >
            Chấm điểm & nhận xét
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                color: COLORS.subText,
                fontSize: 13,
                width: 90,
              }}
            >
              Điểm (0–9):
            </Text>
            <TextInput
              value={score}
              onChangeText={setScore}
              keyboardType="decimal-pad"
              placeholder="Ví dụ: 6.5"
              placeholderTextColor={COLORS.muted}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: COLORS.borderSoft,
                borderRadius: 10,
                paddingHorizontal: 10,
                paddingVertical: 6,
                color: COLORS.text,
                fontSize: 13,
              }}
            />
          </View>

          <Text
            style={{
              color: COLORS.subText,
              fontSize: 13,
              marginBottom: 4,
            }}
          >
            Nhận xét band (fluency, lexical, grammar, pronunciation…)
          </Text>
          <TextInput
            value={bandComment}
            onChangeText={setBandComment}
            multiline
            placeholder="Ví dụ: Fluency tốt, ít ngập ngừng; Grammar còn sai thì/ed…"
            placeholderTextColor={COLORS.muted}
            style={{
              borderWidth: 1,
              borderColor: COLORS.borderSoft,
              borderRadius: 10,
              paddingHorizontal: 10,
              paddingVertical: 8,
              minHeight: 70,
              color: COLORS.text,
              fontSize: 13,
              textAlignVertical: 'top',
              marginBottom: 8,
            }}
          />

          <Text
            style={{
              color: COLORS.subText,
              fontSize: 13,
              marginBottom: 4,
            }}
          >
            Ghi chú cho học viên
          </Text>
          <TextInput
            value={teacherComment}
            onChangeText={setTeacherComment}
            multiline
            placeholder="Lời nhắn chi tiết gửi cho học viên…"
            placeholderTextColor={COLORS.muted}
            style={{
              borderWidth: 1,
              borderColor: COLORS.borderSoft,
              borderRadius: 10,
              paddingHorizontal: 10,
              paddingVertical: 8,
              minHeight: 90,
              color: COLORS.text,
              fontSize: 13,
              textAlignVertical: 'top',
            }}
          />
        </View>

        {/* SAVE BUTTON */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSave}
          disabled={saving}
          style={{
            marginHorizontal: 16,
            marginBottom: 24,
            borderRadius: 999,
            paddingVertical: 10,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: saving ? COLORS.card2 : COLORS.create,
          }}
        >
          <Text
            style={{
              color: COLORS.bg,
              fontSize: 15,
              fontWeight: '700',
            }}
          >
            {saving ? 'Đang lưu…' : 'Lưu kết quả chấm bài'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
