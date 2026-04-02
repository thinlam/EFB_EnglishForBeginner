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

import { ListenStyles as LS } from '@/components/style/user/listen/ListenStyles';

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

/* ===== Types ===== */
type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

type ListenDoc = {
  title: string;
  transcript: string;
  level: CEFR;
  isPublished?: boolean;
  createdAt?: Timestamp | null;
};

const LEVELS: CEFR[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
const CURRENT_LEVEL: CEFR = 'A1';
const PAGE_SIZE = 10;

/* ===== Screen ===== */
export default function ListenScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeLevel, setActiveLevel] = useState<CEFR>(CURRENT_LEVEL);
  const [levelOpen, setLevelOpen] = useState(false);
  const [search, setSearch] = useState('');

  const [firstPage, setFirstPage] =
    useState<QueryDocumentSnapshot<DocumentData>[]>([]);
  const [moreItems, setMoreItems] =
    useState<QueryDocumentSnapshot<DocumentData>[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const items = useMemo(
    () => [...firstPage, ...moreItems],
    [firstPage, moreItems],
  );

  /* ===== Firestore ===== */
  useEffect(() => {
    setLoading(true);
    const q1 = query(
      collection(db, 'listens'),
      where('level', '==', activeLevel),
      where('isPublished', '==', true),
      orderBy('createdAt', 'desc'),
      limit(PAGE_SIZE),
    );

    const unsub = onSnapshot(q1, snap => {
      setFirstPage(snap.docs);
      setMoreItems([]);
      setHasMore(snap.size >= PAGE_SIZE);
      setLoading(false);
    });

    return () => unsub();
  }, [activeLevel]);

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
  }, [activeLevel, hasMore, loadingMore, items]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 400);
  }, []);

  const canEnter = (lv: CEFR) => lv === CURRENT_LEVEL;

  const filteredItems = useMemo(() => {
    const kw = search.trim().toLowerCase();
    if (!kw) return items;
    return items.filter(d => {
      const data = d.data() as ListenDoc;
      return (
        data.title?.toLowerCase().includes(kw) ||
        data.transcript?.toLowerCase().includes(kw)
      );
    });
  }, [items, search]);

  const Card = ({ doc }: { doc: QueryDocumentSnapshot<DocumentData> }) => {
    const d = doc.data() as ListenDoc;
    return (
      <Pressable
        onPress={() =>
          router.push({ pathname: '/listen/[id]', params: { id: doc.id } })
        }
        style={({ pressed }) => [
          LS.card,
          pressed && Platform.OS === 'ios' && LS.cardPressed,
        ]}
      >
        <View style={LS.cardRow}>
          <View style={LS.cardThumb}>
            <Ionicons name="musical-notes" size={22} color="#111827AA" />
          </View>

          <View style={LS.cardContent}>
            <Text numberOfLines={1} style={LS.cardTitle}>
              {d.title || '(No title)'}
            </Text>

            <Text numberOfLines={1} style={LS.cardSubtitle}>
              {d.transcript?.slice(0, 90) || '—'}
            </Text>

            <View style={LS.cardMetaRow}>
              <View style={LS.cardLevelBadge}>
                <Text style={LS.cardLevelText}>{d.level}</Text>
              </View>
            </View>
          </View>

          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={LS.wrap}>
      {/* HEADER */}
      <View
        style={[
          LS.header,
          { paddingTop: Math.max(insets.top, 8) },
        ]}
      >
        <View style={LS.headerRow}>
          <Pressable onPress={() => router.back()} style={LS.backBtn}>
            <Ionicons name="arrow-back" size={20} />
          </Pressable>

          <Text style={LS.headerTitle}>LISTEN</Text>

          {/* LEVEL BUTTON */}
          <Pressable
            onPress={() => setLevelOpen(v => !v)}
            style={LS.levelSelectBtn}
          >
            <Text style={LS.levelSelectText}>{activeLevel}</Text>
            <Ionicons
              name={levelOpen ? 'chevron-up' : 'chevron-down'}
              size={16}
            />
          </Pressable>
        </View>

        {/* LEVEL DROPDOWN */}
        {levelOpen && (
          <View style={LS.levelDropdown}>
            {LEVELS.map(lv => {
              const locked = !canEnter(lv);
              const isActive = lv === activeLevel;

              return (
                <Pressable
                  key={lv}
                  disabled={locked}
                  onPress={() => {
                    if (locked) return;
                    setActiveLevel(lv);
                    setLevelOpen(false);
                  }}
                  style={[
                    LS.levelOption,
                    isActive && LS.levelOptionActive,
                    locked && LS.levelOptionLocked,
                  ]}
                >
                  <Text
                    style={[
                      LS.levelOptionText,
                      isActive && LS.levelOptionTextActive,
                      locked && LS.levelOptionTextLocked,
                    ]}
                  >
                    {lv}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* SEARCH */}
        <View style={LS.searchWrap}>
          <Ionicons name="search" size={18} color="#6B7280" />
          <TextInput
            style={LS.searchInput}
            placeholder="Search bài nghe theo tiêu đề / transcript"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* LIST */}
      {loading ? (
        <View style={LS.loading}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={d => d.id}
          renderItem={({ item }) => <Card doc={item} />}
          contentContainerStyle={[
            LS.listContent,
            { paddingBottom: insets.bottom + 24 },
          ]}
          onEndReachedThreshold={0.3}
          onEndReached={loadMore}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListFooterComponent={
            loadingMore ? <ActivityIndicator /> : null
          }
        />
      )}
    </SafeAreaView>
  );
}
