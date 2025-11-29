// app/(User)/listen/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

/* Styles */
import { ListenStyles as LS } from '@/components/style/user/listen/ListenStyles';

/* Firestore */
import { db } from '@/scripts/firebase';
import {
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  where,
} from 'firebase/firestore';

/* ===== Types & config ===== */
type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
type ExerciseType =
  | 'fill_gaps'
  | 'guess_object'
  | 'phoneme_choice'
  | 'phrase_gaps'
  | 'reading_mcq';

type ListenDoc = {
  title: string;
  transcript: string;
  audioUrl?: string | null;
  mediaType?: string | null;
  level: CEFR;
  exerciseType?: ExerciseType;
  payload?: any;
  isPublished?: boolean;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
};

/* 5 level CEFR */
const TOPICS = [
  { id: 'A1', title: 'A1', color: '#93c5fd' },
  { id: 'A2', title: 'A2', color: '#86efac' },
  { id: 'B1', title: 'B1', color: '#e9d5ff' },
  { id: 'B2', title: 'B2', color: '#fcd34d' },
  { id: 'C1', title: 'C1', color: '#93c5fd' },
] as const;

/* Level hiện tại (tạm hard-code) */
const CURRENT_LEVEL: CEFR = 'A1';

/* ===== MAIN SCREEN ===== */
export default function ListenScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [activeLevel, setActiveLevel] = useState<CEFR>(CURRENT_LEVEL);
  const [search, setSearch] = useState('');

  const PAGE_SIZE = 10;

  // page 1 (realtime)
  const [firstPage, setFirstPage] = useState<
    QueryDocumentSnapshot<DocumentData>[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // load more (non-realtime)
  const [moreItems, setMoreItems] = useState<
    QueryDocumentSnapshot<DocumentData>[]
  >([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const items = useMemo(
    () => [...firstPage, ...moreItems],
    [firstPage, moreItems],
  );

  /* ===== Firestore: realtime trang đầu theo activeLevel ===== */
  useEffect(() => {
    setLoading(true);
    const q1 = query(
      collection(db, 'listens'),
      where('level', '==', activeLevel),
      where('isPublished', '==', true),
      orderBy('createdAt', 'desc'),
      limit(PAGE_SIZE),
    );

    const unsub = onSnapshot(
      q1,
      snap => {
        setFirstPage(snap.docs);
        setLoading(false);
        setHasMore(snap.size >= PAGE_SIZE);
        setMoreItems([]); // reset loadMore khi đổi level
      },
      err => {
        console.error(err);
        setLoading(false);
      },
    );

    return () => unsub();
  }, [activeLevel]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || items.length === 0) return;
    try {
      setLoadingMore(true);
      const last = items[items.length - 1];
      const q2 = query(
        collection(db, 'listens'),
        where('level', '==', activeLevel),
        where('isPublished', '==', true),
        orderBy('createdAt', 'desc'),
        startAfter(last),
        limit(PAGE_SIZE),
      );
      const snap = await getDocs(q2);
      setMoreItems(prev => [...prev, ...snap.docs]);
      if (snap.size < PAGE_SIZE) setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, items, activeLevel]);

  /* Logic mở khóa level (tạm thời chỉ cho CURRENT_LEVEL) */
  const canEnter = (id: CEFR) => id === CURRENT_LEVEL;

  const onChangeLevel = (id: CEFR) => {
    if (!canEnter(id)) {
      // Sau này thêm Alert "Cần thêm XP / Premium để mở khóa"
      return;
    }
    setActiveLevel(id);
  };

  /* Filter bài theo search */
  const filteredItems = useMemo(() => {
    const kw = search.trim().toLowerCase();
    if (!kw) return items;
    return items.filter(d => {
      const data = d.data() as ListenDoc;
      const title = (data.title || '').toLowerCase();
      const transcript = (data.transcript || '').toLowerCase();
      return title.includes(kw) || transcript.includes(kw);
    });
  }, [items, search]);

  /* UI helpers */
  const androidRipple = {
    color: 'rgba(17,24,39,0.08)',
    borderless: false,
  } as const;

  const Card = ({ doc }: { doc: QueryDocumentSnapshot<DocumentData> }) => {
    const d = doc.data() as ListenDoc;

    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: '/listen/[id]', // group (User) tự ẩn
            params: { id: doc.id },
          })
        }
        android_ripple={androidRipple}
        style={({ pressed }) => [
          LS.card,
          pressed && Platform.OS === 'ios' && LS.cardPressed,
        ]}
        accessibilityLabel={`Mở ${d.title || 'bài nghe'}`}
      >
        <View style={LS.cardRow}>
          {/* Thumbnail “ảo” */}
          <View style={LS.cardThumb}>
            <Ionicons name="musical-notes" size={22} color="#111827AA" />
          </View>

          <View style={LS.cardContent}>
            <Text numberOfLines={1} style={LS.cardTitle}>
              {d.title || '(No title)'}
            </Text>

            <Text numberOfLines={1} style={LS.cardSubtitle}>
              {d.transcript?.trim() ? d.transcript.slice(0, 90) : '—'}
            </Text>

            <View style={LS.cardMetaRow}>
              <View style={LS.cardLevelBadge}>
                <Text style={LS.cardLevelText}>{d.level}</Text>
              </View>

              {!!d.exerciseType && (
                <View style={LS.cardExerciseBadge}>
                  <Text style={LS.cardExerciseText}>
                    {d.exerciseType.replace(/_/g, ' ')}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </View>
      </Pressable>
    );
  };

  const renderItem = ({ item }: { item: QueryDocumentSnapshot<DocumentData> }) => (
    <Card doc={item} />
  );

  /* RENDER */
  return (
    <SafeAreaView style={LS.wrap}>
      {/* Header */}
      <View
        style={[
          LS.header,
          { paddingTop: Math.max(insets.top, 8) },
          Platform.OS !== 'ios' && LS.headerBorder,
        ]}
      >
        <View style={LS.headerRow}>
          <Pressable
            onPress={() => router.back()}
            android_ripple={androidRipple}
            style={({ pressed }) => [
              LS.backBtn,
              pressed && Platform.OS === 'ios' && LS.backBtnPressed,
            ]}
            accessibilityLabel="Quay lại"
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </Pressable>

          <View style={LS.headerTitleWrap}>
            <Text numberOfLines={1} style={LS.headerTitle}>
              LISTEN • {activeLevel}
            </Text>
          </View>

          <View style={LS.headerRightPlaceholder} />
        </View>

        {/* Thanh chọn level */}
        <View style={LS.levelsRow}>
          {TOPICS.map(item => {
            const id = item.id as CEFR;
            const locked = !canEnter(id);
            const isActive = id === activeLevel;

            return (
              <Pressable
                key={id}
                onPress={() => onChangeLevel(id)}
                disabled={locked}
                android_ripple={androidRipple}
                style={({ pressed }) => [
                  LS.levelBtn,
                  isActive && LS.levelBtnActive,
                  locked && LS.levelBtnLocked,
                  !locked &&
                    pressed &&
                    Platform.OS === 'ios' &&
                    LS.levelBtnPressed,
                ]}
              >
                <Text
                  style={[
                    LS.levelText,
                    isActive && LS.levelTextActive,
                    locked && LS.levelTextLocked,
                  ]}
                >
                  {id}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Search */}
        <View style={LS.searchWrap}>
          <Ionicons name="search" size={18} color="#6b7280" />
          <TextInput
            style={LS.searchInput}
            placeholder="Search bài nghe theo tiêu đề / transcript"
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
          />
        </View>
      </View>

      {/* Danh sách bài */}
      {loading ? (
        <View style={LS.loading}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={d => d.id}
          renderItem={renderItem}
          contentContainerStyle={[
            LS.listContent,
            { paddingBottom: insets.bottom + 24 },
          ]}
          style={LS.list}
          onEndReachedThreshold={0.3}
          onEndReached={loadMore}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={LS.listFooter}>
                <ActivityIndicator />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={LS.empty}>
              <Text style={LS.emptyText}>
                Chưa có bài nào được xuất bản cho level này.
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
