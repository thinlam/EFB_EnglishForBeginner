// app/(admin)/speaking/attempts.tsx
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from '@/components/style/colors/AppColors';
import { db } from '@/scripts/firebase';

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
  createdAt?: Date | null;
};

type SpeakingLesson = {
  id: string;
  title: string;
  prompt?: string;
  level?: CEFR;
};

type AttemptItem = SpeakingAttempt & {
  lessonTitle?: string;
  lessonPrompt?: string;
};

const STATUS_FILTERS: ('ALL' | AttemptStatus)[] = ['ALL', 'pending', 'reviewed'];
const LEVELS: ('ALL' | CEFR)[] = ['ALL', 'A1', 'A2', 'B1', 'B2', 'C1'];

function formatSeconds(sec?: number) {
  if (!sec && sec !== 0) return '—';
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(r).padStart(2, '0');
  return `${mm}:${ss}`;
}

function formatDate(d?: Date | null) {
  if (!d) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function snippet(s?: string, max = 80) {
  if (!s) return '';
  const one = s.replace(/\s+/g, ' ').trim();
  return one.length > max ? one.slice(0, max) + '…' : one;
}

function colorForLevel(l?: CEFR | null) {
  switch (l) {
    case 'A1':
      return '#22c55e';
    case 'A2':
      return '#10b981';
    case 'B1':
      return '#06b6d4';
    case 'B2':
      return '#60a5fa';
    case 'C1':
      return '#a78bfa';
    default:
      return '#6b7280';
  }
}

function statusLabel(st?: AttemptStatus) {
  if (st === 'reviewed') return 'Đã chấm';
  if (st === 'pending') return 'Chưa chấm';
  return 'Chưa chấm';
}

function statusColor(st?: AttemptStatus) {
  if (st === 'reviewed') return '#22c55e';
  if (st === 'pending') return '#facc15';
  return '#facc15';
}

const SpeakingAttemptsScreen: React.FC = () => {
  const router = useRouter();

  const [items, setItems] = useState<AttemptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | AttemptStatus>('ALL');
  const [levelFilter, setLevelFilter] = useState<'ALL' | CEFR>('ALL');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const colRef = collection(db, 'speaking_attempts');
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);

      const attempts: SpeakingAttempt[] = snap.docs.map((d) => {
        const raw = d.data() as any;
        return {
          id: d.id,
          userId: raw.userId ?? '',
          lessonId: raw.lessonId ?? '',
          durationSec:
            typeof raw.durationSec === 'number' ? raw.durationSec : undefined,
          fileUrl: raw.fileUrl ?? '',
          level: (raw.level as CEFR | null) ?? null,
          status: (raw.status as AttemptStatus) ?? 'pending',
          teacherScore:
            typeof raw.teacherScore === 'number' ? raw.teacherScore : null,
          createdAt:
            raw.createdAt instanceof Timestamp ? raw.createdAt.toDate() : null,
        };
      });

      // load info bài học
      const lessonIds = Array.from(
        new Set(attempts.map((a) => a.lessonId).filter(Boolean))
      );
      const lessonMap: Record<string, SpeakingLesson> = {};

      await Promise.all(
        lessonIds.map(async (lid) => {
          try {
            const snap = await getDoc(doc(db, 'speaking_lessons', lid));
            if (snap.exists()) {
              const raw = snap.data() as any;
              lessonMap[lid] = {
                id: snap.id,
                title: raw.title ?? '(No title)',
                prompt: raw.prompt ?? '',
                level: (raw.level as CEFR) ?? undefined,
              };
            }
          } catch (e) {
            console.log('load lesson error', e);
          }
        })
      );

      const enriched: AttemptItem[] = attempts.map((a) => {
        const lesson = lessonMap[a.lessonId];
        return {
          ...a,
          lessonTitle: lesson?.title ?? '(No title)',
          lessonPrompt: lesson?.prompt ?? '',
          level: (a.level as CEFR | null) ?? (lesson?.level as CEFR | undefined),
        };
      });

      setItems(enriched);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const filteredItems = useMemo(() => {
    const text = searchText.trim().toLowerCase();
    return items.filter((it) => {
      const matchText =
        !text ||
        it.lessonTitle?.toLowerCase().includes(text) ||
        (it.lessonPrompt ?? '').toLowerCase().includes(text) ||
        it.userId.toLowerCase().includes(text);

      const matchStatus =
        statusFilter === 'ALL'
          ? true
          : (it.status ?? 'pending') === statusFilter;

      const matchLevel =
        levelFilter === 'ALL'
          ? true
          : (it.level as CEFR | undefined) === levelFilter;

      return matchText && matchStatus && matchLevel;
    });
  }, [items, searchText, statusFilter, levelFilter]);

  const renderItem = ({ item }: { item: AttemptItem }) => {
    const levelColor = colorForLevel(item.level as CEFR | null);
    const shortUser =
      item.userId.length > 8 ? `${item.userId.slice(0, 6)}…` : item.userId;

    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: '/(admin)/speaking/attempt-detail',
            params: { id: item.id },
          })
        }
        activeOpacity={0.85}
        style={{
          marginHorizontal: 16,
          marginBottom: 12,
          padding: 12,
          borderRadius: 14,
          backgroundColor: COLORS.card,
          borderWidth: 1,
          borderColor: COLORS.borderSoft,
        }}
      >
        {/* dòng 1: title + level + status */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 4,
          }}
        >
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 999,
              backgroundColor: levelColor,
              marginRight: 8,
            }}
          >
            <Text
              style={{
                color: '#0b1120',
                fontWeight: '700',
                fontSize: 11,
              }}
            >
              {item.level ?? '—'}
            </Text>
          </View>

          <Text
            style={{
              flex: 1,
              color: COLORS.text,
              fontSize: 14,
              fontWeight: '600',
            }}
            numberOfLines={2}
          >
            {item.lessonTitle}
          </Text>

          <View
            style={{
              marginLeft: 8,
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 999,
              backgroundColor: statusColor(item.status),
            }}
          >
            <Text
              style={{
                color: '#0b1120',
                fontSize: 11,
                fontWeight: '600',
              }}
            >
              {statusLabel(item.status)}
            </Text>
          </View>
        </View>

        {/* dòng 2: user + time + score */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 4,
          }}
        >
          <Ionicons
            name="person-circle-outline"
            size={14}
            color={COLORS.subText}
          />
          <Text
            style={{
              color: COLORS.subText,
              fontSize: 12,
              marginLeft: 4,
            }}
          >
            Học viên: {shortUser || 'N/A'}
          </Text>

          {!!item.durationSec && (
            <>
              <Text
                style={{
                  color: COLORS.subText,
                  fontSize: 12,
                  marginHorizontal: 4,
                }}
              >
                •
              </Text>
              <Ionicons
                name="timer-outline"
                size={14}
                color={COLORS.subText}
              />
              <Text
                style={{
                  color: COLORS.subText,
                  fontSize: 12,
                  marginLeft: 2,
                }}
              >
                {formatSeconds(item.durationSec)}
              </Text>
            </>
          )}

          {typeof item.teacherScore === 'number' && (
            <>
              <Text
                style={{
                  color: COLORS.subText,
                  fontSize: 12,
                  marginHorizontal: 4,
                }}
              >
                •
              </Text>
              <Ionicons name="star-outline" size={14} color={COLORS.subText} />
              <Text
                style={{
                  color: COLORS.subText,
                  fontSize: 12,
                  marginLeft: 2,
                }}
              >
                {item.teacherScore.toFixed(1)}
              </Text>
            </>
          )}
        </View>

        {/* dòng 3: đề bài */}
        {!!item.lessonPrompt && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons
              name="chatbox-ellipses-outline"
              size={14}
              color={COLORS.subText}
            />
            <Text
              style={{
                color: COLORS.subText,
                fontSize: 12,
                marginLeft: 4,
                flex: 1,
              }}
              numberOfLines={2}
            >
              {snippet(item.lessonPrompt)}
            </Text>
          </View>
        )}

        {/* dòng 4: ngày gửi */}
        {item.createdAt && (
          <Text
            style={{
              marginTop: 4,
              color: COLORS.muted,
              fontSize: 11,
            }}
          >
            Gửi lúc: {formatDate(item.createdAt)}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

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
        <TouchableOpacity
          onPress={() => router.push('/(admin)/home')}
          style={{ padding: 4, marginRight: 8 }}
        >
          <Ionicons name="arrow-back-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text
          style={{
            color: COLORS.text,
            fontSize: 18,
            fontWeight: '700',
            flex: 1,
          }}
        >
          Bài nói học viên
        </Text>
      </View>

      {/* FILTER BAR */}
      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        {/* search */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: 999,
            backgroundColor: COLORS.card,
            borderWidth: 1,
            borderColor: COLORS.borderSoft,
            paddingHorizontal: 10,
            paddingVertical: 6,
            marginBottom: 6,
          }}
        >
          <Ionicons
            name="search-outline"
            size={16}
            color={COLORS.muted}
          />
          <TextInput
            placeholder="Tìm theo tiêu đề bài, học viên, đề bài…"
            placeholderTextColor={COLORS.muted}
            value={searchText}
            onChangeText={setSearchText}
            style={{
              flex: 1,
              marginLeft: 6,
              color: COLORS.text,
              fontSize: 13,
            }}
            returnKeyType="search"
          />
        </View>

        {/* status chips */}
        <View style={{ flexDirection: 'row', marginTop: 4, marginBottom: 2 }}>
          <FlatList
            data={STATUS_FILTERS}
            keyExtractor={(v) => v}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 2 }}
            renderItem={({ item }) => {
              const selected = item === statusFilter;
              const label =
                item === 'ALL'
                  ? 'Tất cả'
                  : item === 'pending'
                  ? 'Chưa chấm'
                  : 'Đã chấm';
              return (
                <TouchableOpacity
                  onPress={() => setStatusFilter(item)}
                  style={{
                    marginRight: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: selected ? COLORS.create : COLORS.borderSoft,
                    backgroundColor: selected ? COLORS.card2 : COLORS.bg,
                  }}
                >
                  <Text
                    style={{
                      color: selected ? COLORS.text : COLORS.muted,
                      fontSize: 12,
                    }}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* level chips */}
        <View style={{ flexDirection: 'row', marginTop: 2 }}>
          <FlatList
            data={LEVELS}
            keyExtractor={(v) => v}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 2 }}
            renderItem={({ item }) => {
              const selected = item === levelFilter;
              return (
                <TouchableOpacity
                  onPress={() => setLevelFilter(item)}
                  style={{
                    marginRight: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: selected ? COLORS.create : COLORS.borderSoft,
                    backgroundColor: selected ? COLORS.card2 : COLORS.bg,
                  }}
                >
                  <Text
                    style={{
                      color: selected ? COLORS.text : COLORS.muted,
                      fontSize: 12,
                    }}
                  >
                    {item === 'ALL' ? 'All level' : `Level ${item}`}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 32 }} color={COLORS.create} />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.text}
            />
          }
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={
            <View
              style={{
                alignItems: 'center',
                marginTop: 48,
                paddingHorizontal: 24,
              }}
            >
              <Text
                style={{
                  color: COLORS.muted,
                  fontSize: 14,
                  textAlign: 'center',
                }}
              >
                Chưa có bài nói nào được gửi lên.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default SpeakingAttemptsScreen;
