// app/listen/[level].tsx
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

/* Styles tái dùng */

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

type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
type ExerciseType = 'fill_gaps' | 'guess_object' | 'phoneme_choice' | 'phrase_gaps' | 'reading_mcq';

type ListenDoc = {
  title: string;
  transcript: string;
  audioUrl?: string | null;
  mediaType?: string | null;
  level: CEFR;
  exerciseType?: ExerciseType;
  payload?: any;
  isPublished?: boolean;      // <— dùng isPublished đồng nhất với Admin
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
};

export default function ListenByLevelScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { level } = useLocalSearchParams<{ level: CEFR }>();
  const lv: CEFR = (level as CEFR) || 'A1';

  const PAGE_SIZE = 10;

  // page 1 (realtime)
  const [firstPage, setFirstPage] = useState<QueryDocumentSnapshot<DocumentData>[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // load more (non-realtime)
  const [moreItems, setMoreItems] = useState<QueryDocumentSnapshot<DocumentData>[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const items = useMemo(() => [...firstPage, ...moreItems], [firstPage, moreItems]);

  // ===== Firestore (realtime trang đầu) =====
  useEffect(() => {
    setLoading(true);
    const q1 = query(
      collection(db, 'listens'),
      where('level', '==', lv),
      where('isPublished', '==', true),
      orderBy('createdAt', 'desc'),
      limit(PAGE_SIZE)
    );

    const unsub = onSnapshot(
      q1,
      (snap) => {
        setFirstPage(snap.docs);
        setLoading(false);
        setHasMore(snap.size >= PAGE_SIZE);
        setMoreItems([]); // reset phần load thêm để tránh trùng khi có doc mới
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [lv]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // onSnapshot đã realtime — delay nhẹ cho UX
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || items.length === 0) return;
    try {
      setLoadingMore(true);
      const last = items[items.length - 1];
      const q2 = query(
        collection(db, 'listens'),
        where('level', '==', lv),
        where('isPublished', '==', true),      // <— đồng nhất field
        orderBy('createdAt', 'desc'),
        startAfter(last),
        limit(PAGE_SIZE)
      );
      const snap = await getDocs(q2);
      setMoreItems((prev) => [...prev, ...snap.docs]);
      if (snap.size < PAGE_SIZE) setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, items, lv]);

  // ======= UI helpers =======
  const androidRipple = { color: 'rgba(17,24,39,0.08)', borderless: false } as const;

  const Card = ({ doc }: { doc: QueryDocumentSnapshot<DocumentData> }) => {
    const d = doc.data() as ListenDoc;

    return (
      <Pressable
        onPress={() => router.push({ pathname: '/listien/item/[id]', params: { id: doc.id } })}
        android_ripple={androidRipple}
        style={({ pressed }) => ([
          {
            borderRadius: 16,
            padding: 14,
            backgroundColor: '#fff',
            // Shadow iOS
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            // Elevation Android
            elevation: 2,
            opacity: pressed && Platform.OS === 'ios' ? 0.96 : 1,
          },
        ])}
        accessibilityLabel={`Mở ${d.title || 'bài nghe'}`}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {/* Thumbnail “ảo” — giữ layout ổn định, bạn có thể đổi thành ảnh thật */}
          <View
            style={{
              width: 54,
              height: 54,
              borderRadius: 12,
              backgroundColor: '#11182712',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="musical-notes" size={22} color="#111827AA" />
          </View>

          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              numberOfLines={1}
              style={{ color: '#111827', fontSize: 16, fontWeight: '700' }}
            >
              {d.title || '(No title)'}
            </Text>

            {/* Subtitle / transcript preview */}
            <Text
              numberOfLines={1}
              style={{ color: '#4b5563', fontSize: 13, marginTop: 2 }}
            >
              {d.transcript?.trim() ? d.transcript.slice(0, 90) : '—'}
            </Text>

            {/* Meta row: level + exercise */}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              <View style={{
                paddingHorizontal: 10, paddingVertical: 5,
                backgroundColor: '#1118270C', borderRadius: 999,
                borderWidth: 1, borderColor: '#E5E7EB',
              }}>
                <Text style={{ fontSize: 12, color: '#111827', fontWeight: '700' }}>
                  {d.level}
                </Text>
              </View>

              {!!d.exerciseType && (
                <View style={{
                  paddingHorizontal: 10, paddingVertical: 5,
                  backgroundColor: '#F3F4F6', borderRadius: 999,
                  borderWidth: 1, borderColor: '#E5E7EB',
                }}>
                  <Text style={{ fontSize: 12, color: '#374151' }}>
                    {d.exerciseType.replace(/_/g, ' ')}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Chevron */}
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </View>
      </Pressable>
    );
  };

  const renderItem = ({ item }: { item: QueryDocumentSnapshot<DocumentData> }) => (
    <Card doc={item} />
  );

  // ======= RENDER =======
  // Nền để hợp với dark header (nếu bạn dùng), vẫn OK với light theme
  const bg = '#F8FAFC';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      {/* Header — an toàn tai thỏ/giọt nước */}
      <View
        style={{
          paddingTop: Math.max(insets.top, 8),
          paddingHorizontal: 16,
          paddingBottom: 10,
          backgroundColor: bg,
          borderBottomWidth: Platform.OS === 'ios' ? 0 : 1,
          borderBottomColor: '#E5E7EB',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable
            onPress={() => router.back()}
            android_ripple={androidRipple}
            style={({ pressed }) => ([
              {
                width: 36, height: 36, borderRadius: 10,
                alignItems: 'center', justifyContent: 'center',
                backgroundColor: '#fff',
                shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
                elevation: 1,
                opacity: pressed && Platform.OS === 'ios' ? 0.85 : 1,
              },
            ])}
            accessibilityLabel="Quay lại"
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </Pressable>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text
              numberOfLines={1}
              style={{ color: '#111827', fontSize: 16, fontWeight: '800' }}
            >
              LISTEN • {lv}
            </Text>
          </View>

          {/* Placeholder cân đối bên phải */}
          <View style={{ width: 36, height: 36 }} />
        </View>
      </View>

      {/* Danh sách */}
      {loading ? (
        <View style={{ padding: 24 }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(d) => d.id}
          renderItem={renderItem}
          // “content width” đẹp ở máy lớn
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: insets.bottom + 24,
            gap: 12,
            maxWidth: 720,
            alignSelf: 'center',
            width: '100%',
          }}
          style={{ flex: 1 }}
          onEndReachedThreshold={0.3}
          onEndReached={loadMore}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={{ paddingVertical: 12 }}>
                <ActivityIndicator />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={{ padding: 24, alignItems: 'center' }}>
              <Text style={{ color: '#6B7280' }}>Chưa có bài nào được xuất bản cho level này.</Text>
            </View>
          }
          // iOS: tự canh inset với notch
          contentInsetAdjustmentBehavior="automatic"
          // scroll bar tránh đè notch
          scrollIndicatorInsets={{ top: 4, bottom: insets.bottom + 4, left: 0, right: 0 }}
        />
      )}
    </SafeAreaView>
  );
}
