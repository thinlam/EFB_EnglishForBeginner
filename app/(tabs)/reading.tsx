// app/(tabs)/reading/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthProfile } from '@/hooks/tab/useAuthProfile';
import { db } from '@/scripts/firebase';

type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
type Topic =
  | 'Work & Office'
  | 'Travel & Transport'
  | 'Daily Life'
  | 'Shopping & Service'
  | 'Education'
  | 'Technology'
  | 'Entertainment'
  | 'Health & Food'
  | 'Business';

type Reading = {
  id: string;
  title: string;
  passage?: string;
  sourceUrl?: string;
  level?: CEFR;
  topic?: Topic;
  bandMin?: number;
  bandMax?: number;
  questionsCount?: number;
  createdAt?: Date | null;
};

function bandLabel(min?: number, max?: number) {
  if (!min && !max) return '—';
  if (min && max) return `${min}–${max}`;
  if (min && !max) return `${min}+`;
  return `${max}`;
}

function wordsCount(s?: string) {
  if (!s) return 0;
  return s.trim().split(/\s+/).filter(Boolean).length;
}

const BG = '#F8FAFC';
const CARD = '#FFFFFF';
const TEXT = '#111827';
const SUBTEXT = '#6B7280';
const BORDER = '#E5E7EB';
const PRIMARY = '#4F46E5';

export default function ReadingListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { level: userLevel } = useAuthProfile(); // ví dụ "A1"

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Reading[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // ===== LOAD LIST =====
  useEffect(() => {
    const col = collection(db, 'readings');
    const qBase = query(col, orderBy('createdAt', 'desc'));

    const unsub = onSnapshot(
      qBase,
      (snap) => {
        const data: Reading[] = snap.docs.map((d) => {
          const raw = d.data() as any;
          return {
            id: d.id,
            title: raw.title ?? '(Không tiêu đề)',
            passage: raw.passage ?? '',
            sourceUrl: raw.sourceUrl ?? '',
            level: raw.level as CEFR,
            topic: raw.topic as Topic,
            bandMin:
              typeof raw.bandMin === 'number' ? raw.bandMin : undefined,
            bandMax:
              typeof raw.bandMax === 'number' ? raw.bandMax : undefined,
            questionsCount:
              typeof raw.questionsCount === 'number'
                ? raw.questionsCount
                : undefined,
            createdAt:
              raw.createdAt instanceof Timestamp
                ? raw.createdAt.toDate()
                : null,
          };
        });
        setItems(data);
        setLoading(false);
        setRefreshing(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
        setRefreshing(false);
      },
    );

    return () => unsub();
  }, []);

  // lọc theo CEFR + search (nếu sau này thêm search)
  const filtered = useMemo(() => {
    let data = items;
    if (userLevel && ['A1', 'A2', 'B1', 'B2', 'C1'].includes(userLevel)) {
      data = data.filter((it) => it.level === userLevel);
    }
    return data;
  }, [items, userLevel]);

  const onRefresh = useCallback(() => {
    // onSnapshot realtime rồi, chỉ show loading cho đẹp
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const androidRipple = {
    color: 'rgba(17,24,39,0.06)',
    borderless: false,
  } as const;

  const Card = ({ item }: { item: Reading }) => {
    const wc = wordsCount(item.passage);

    return (
      <Pressable
        onPress={() =>
          router.push({ pathname: '/reading/[id]', params: { id: item.id } })
        }
        android_ripple={androidRipple}
        style={({ pressed }) => [
          {
            borderRadius: 16,
            padding: 14,
            backgroundColor: CARD,
            // shadow iOS
            shadowColor: '#000',
            shadowOpacity: 0.06,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            // elevation Android
            elevation: 2,
            opacity: pressed && Platform.OS === 'ios' ? 0.96 : 1,
          },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {/* icon bên trái */}
          <View
            style={{
              width: 54,
              height: 54,
              borderRadius: 12,
              backgroundColor: '#1118270D',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="book-outline" size={22} color="#111827AA" />
          </View>

          {/* text */}
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              numberOfLines={1}
              style={{ color: TEXT, fontSize: 16, fontWeight: '700' }}
            >
              {item.title}
            </Text>
            <Text
              numberOfLines={1}
              style={{ color: SUBTEXT, fontSize: 13, marginTop: 2 }}
            >
              {(item.topic ?? 'Daily Life') +
                ' • ' +
                bandLabel(item.bandMin, item.bandMax) +
                (wc ? ` • ${wc} từ` : '')}
            </Text>

            {/* meta chips */}
            <View
              style={{
                flexDirection: 'row',
                gap: 8,
                marginTop: 8,
                flexWrap: 'wrap',
              }}
            >
              {item.level && (
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 999,
                    backgroundColor: '#EFF6FF',
                    borderWidth: 1,
                    borderColor: '#DBEAFE',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: PRIMARY,
                      fontWeight: '700',
                    }}
                  >
                    {item.level}
                  </Text>
                </View>
              )}

              {typeof item.questionsCount === 'number' && (
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 999,
                    backgroundColor: '#F3F4F6',
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                  }}
                >
                  <Text style={{ fontSize: 12, color: SUBTEXT }}>
                    {item.questionsCount} câu hỏi
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* chevron */}
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </View>
      </Pressable>
    );
  };

  // ===== RENDER =====
  const currentLevelLabel = userLevel && ['A1', 'A2', 'B1', 'B2', 'C1'].includes(userLevel)
    ? userLevel
    : 'All';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      {/* header kiểu LISTEN • A1 */}
      <View
        style={{
          paddingTop: Math.max(insets.top, 8),
          paddingHorizontal: 16,
          paddingBottom: 10,
          backgroundColor: BG,
          borderBottomWidth: Platform.OS === 'ios' ? 0 : 1,
          borderBottomColor: BORDER,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              color: TEXT,
              fontSize: 16,
              fontWeight: '800',
            }}
          >
            READING • {currentLevelLabel}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={{ padding: 24 }}>
          <ActivityIndicator />
        </View>
      ) : ( 
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Card item={item} />}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: insets.bottom + 24,
            gap: 12,
            maxWidth: 720,
            alignSelf: 'center',
            width: '100%',
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={{ padding: 24, alignItems: 'center' }}>
              <Text style={{ color: SUBTEXT }}>
                Chưa có bài đọc nào cho level này.
              </Text>
            </View>
          }
          contentInsetAdjustmentBehavior="automatic"
          scrollIndicatorInsets={{
            top: 4,
            bottom: insets.bottom + 4,
            left: 0,
            right: 0,
          }}
        />
      )}
    </SafeAreaView>
  );
}
