// app/(admin)/study-materials/index.tsx
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { db } from '@/scripts/firebase';
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    limit,
    orderBy,
    query,
    QueryDocumentSnapshot,
    startAfter,
    where,
} from 'firebase/firestore';

import type { CEFR, StudyMaterial, StudyMaterialType } from '@/types/admin/studyMaterial';

type LevelFilter = CEFR | 'ALL';
type FileFilter = 'all' | StudyMaterialType;

const PAGE_SIZE = 20;
const LEVELS: LevelFilter[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'ALL'];

/* Reusable chip */
const Chip = ({
  active,
  label,
  onPress,
  activeBg = '#4F46E5',
  activeText = '#fff',
  inactiveBg = '#EEF2FF',
  inactiveText = '#4F46E5',
}: {
  active: boolean;
  label: string;
  onPress: () => void;
  activeBg?: string;
  activeText?: string;
  inactiveBg?: string;
  inactiveText?: string;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      marginRight: 8,
      backgroundColor: active ? activeBg : inactiveBg,
    }}
  >
    <Text style={{ color: active ? activeText : inactiveText, fontWeight: '700' }}>{label}</Text>
  </TouchableOpacity>
);

export default function StudyMaterialsAdminScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const colRef = useMemo(() => collection(db, 'studyMaterials'), []);
  const lastDocRef = useRef<QueryDocumentSnapshot | null>(null);

  const [items, setItems] = useState<(StudyMaterial & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [searchText, setSearchText] = useState('');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('ALL');
  const [fileFilter, setFileFilter] = useState<FileFilter>('all');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'title'>('updatedAt');

  /* ========= Query builder ========= */
  const buildQuery = useCallback(() => {
    const clauses: any[] = [];

    if (levelFilter !== 'ALL') {
      clauses.push(where('level', '==', levelFilter));
    }
    if (fileFilter !== 'all') {
      clauses.push(where('type', '==', fileFilter));
    }

    clauses.push(
      orderBy(sortBy === 'title' ? 'title' : 'updatedAt', sortBy === 'title' ? 'asc' : 'desc'),
      limit(PAGE_SIZE),
    );

    return query(colRef, ...clauses);
  }, [colRef, levelFilter, fileFilter, sortBy]);

  const applySearch = useCallback(
    (arr: (StudyMaterial & { id: string })[]) => {
      const t = searchText.trim().toLowerCase();
      if (!t) return arr;

      return arr.filter((it) => {
        const inTitle = it.title?.toLowerCase().includes(t);
        const inDesc = it.description?.toLowerCase().includes(t);
        const inTag = (it.tags || []).some((x) => x.toLowerCase().includes(t));
        const inUrl = it.url?.toLowerCase().includes(t);
        return inTitle || inDesc || inTag || inUrl;
      });
    },
    [searchText],
  );

  /* ========= Fetch first page ========= */
  const fetchFirst = useCallback(async () => {
    setLoading(true);
    setHasMore(true);
    lastDocRef.current = null;

    try {
      const qRef = buildQuery();
      const snap = await getDocs(qRef);
      const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as StudyMaterial) }));

      setItems(applySearch(data));
      setHasMore(snap.docs.length === PAGE_SIZE);
      lastDocRef.current = snap.docs.length ? snap.docs[snap.docs.length - 1] : null;
    } catch (e) {
      console.warn('fetchFirst error', e);
      Alert.alert('Lỗi', 'Không tải được danh sách tài liệu.');
    } finally {
      setLoading(false);
    }
  }, [buildQuery, applySearch]);

  /* ========= Fetch more ========= */
  const fetchMore = useCallback(async () => {
    if (!hasMore || loading || refreshing || !lastDocRef.current) return;

    try {
      const clauses: any[] = [];
      if (levelFilter !== 'ALL') clauses.push(where('level', '==', levelFilter));
      if (fileFilter !== 'all') clauses.push(where('type', '==', fileFilter));

      clauses.push(
        orderBy(sortBy === 'title' ? 'title' : 'updatedAt', sortBy === 'title' ? 'asc' : 'desc'),
        startAfter(lastDocRef.current),
        limit(PAGE_SIZE),
      );

      const qRef = query(colRef, ...clauses);
      const snap = await getDocs(qRef);
      const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as StudyMaterial) }));

      setItems((prev) => [...prev, ...applySearch(data)]);
      setHasMore(snap.docs.length === PAGE_SIZE);
      lastDocRef.current =
        snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : lastDocRef.current;
    } catch (e) {
      console.warn('fetchMore error', e);
    }
  }, [colRef, hasMore, loading, refreshing, sortBy, levelFilter, fileFilter, applySearch]);

  useEffect(() => {
    fetchFirst();
  }, [levelFilter, fileFilter, sortBy, searchText]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFirst();
    setRefreshing(false);
  }, [fetchFirst]);

  /* ========= Actions ========= */

  const handleDelete = useCallback((id: string) => {
    Alert.alert('Xoá tài liệu?', 'Bạn chắc chắn muốn xoá?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'studyMaterials', id));
            setItems((prev) => prev.filter((x) => x.id !== id));
            Alert.alert('Đã xoá', 'Tài liệu đã được xoá.');
          } catch (e) {
            console.warn('delete error', e);
            Alert.alert('Lỗi', 'Không thể xoá tài liệu.');
          }
        },
      },
    ]);
  }, []);

  const openDetail = useCallback(
    (id: string) => {
      router.push({
        pathname: '/(admin)/study-materials/detail',
        params: { id },
      });
    },
    [router],
  );

  const openEdit = useCallback(
    (id?: string) => {
      router.push(
        id
          ? { pathname: '/(admin)/study-materials/edit', params: { id } }
          : { pathname: '/(admin)/study-materials/edit' },
      );
    },
    [router],
  );

  /* ========= List render ========= */

  const renderItem = useCallback(
    ({ item }: { item: StudyMaterial & { id: string } }) => {
      const type = item.type || 'pdf';
      const level = (item.level || 'A1') as CEFR | 'ALL';

      return (
        <TouchableOpacity
          onPress={() => openDetail(item.id)}
          activeOpacity={0.9}
          style={{
            marginHorizontal: 16,
            marginVertical: 6,
            borderRadius: 16,
            backgroundColor: '#FFFFFF',
            padding: 14,
            elevation: 1,
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                backgroundColor: '#EEF2FF',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <MaterialCommunityIcons
                name={type === 'pdf' ? 'file-pdf-box' : 'file-word-box'}
                size={30}
                color={type === 'pdf' ? '#DC2626' : '#2563EB'}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text
                style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}
                numberOfLines={1}
              >
                {item.description || 'Không có mô tả'}
              </Text>

              <View style={{ flexDirection: 'row', marginTop: 6 }}>
                <View
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 999,
                    backgroundColor: '#EEF2FF',
                    marginRight: 6,
                  }}
                >
                  <Text style={{ fontSize: 11, color: '#4F46E5', fontWeight: '600' }}>
                    {type.toUpperCase()}
                  </Text>
                </View>
                <View
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 999,
                    backgroundColor: '#ECFDF3',
                  }}
                >
                  <Text style={{ fontSize: 11, color: '#15803D', fontWeight: '600' }}>
                    Level {level === 'ALL' ? 'All' : level}
                  </Text>
                </View>
              </View>

              {!!item.tags?.length && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
                  {item.tags.slice(0, 3).map((t, idx) => (
                    <View
                      key={idx}
                      style={{
                        paddingHorizontal: 6,
                        paddingVertical: 3,
                        borderRadius: 999,
                        backgroundColor: '#F3F4F6',
                        marginRight: 4,
                        marginBottom: 4,
                      }}
                    >
                      <Text style={{ fontSize: 10, color: '#4B5563' }}>#{t}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={{ marginLeft: 8, alignItems: 'flex-end' }}>
              <TouchableOpacity onPress={() => openEdit(item.id)} style={{ padding: 4 }}>
                <Ionicons name="create-outline" size={20} color="#374151" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={{ padding: 4 }}>
                <Ionicons name="trash-outline" size={20} color="#DC2626" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [openDetail, openEdit, handleDelete],
  );

  const keyExtractor = useCallback((it: StudyMaterial & { id: string }) => it.id, []);

  const ListHeader = useMemo(
    () => (
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingBottom: 8,
          backgroundColor: '#FFFFFF',
        }}
      >
        {/* Title + Add */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: 8,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827', flex: 1 }}>
            Tài liệu học tập
          </Text>
          <TouchableOpacity
            onPress={() => openEdit()}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#4F46E5',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 10,
            }}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '700', marginLeft: 4 }}>Thêm mới</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View
          style={{
            marginHorizontal: 16,
            marginBottom: 8,
            borderRadius: 12,
            backgroundColor: '#F3F4F6',
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            height: 44,
          }}
        >
          <Ionicons name="search" size={18} color="#6B7280" />
          <TextInput
            placeholder="Tìm theo tiêu đề, mô tả, tag…"
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={setSearchText}
            style={{ flex: 1, marginLeft: 8, color: '#111827' }}
            returnKeyType="search"
          />
          {!!searchText && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
        >
          {/* Sort */}
          <TouchableOpacity
            onPress={() => setSortBy((s) => (s === 'updatedAt' ? 'title' : 'updatedAt'))}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: '#E5E7EB',
              marginRight: 8,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Ionicons name="swap-vertical" size={16} color="#111827" />
            <Text style={{ marginLeft: 6, fontWeight: '600', color: '#111827' }}>
              {sortBy === 'updatedAt' ? 'Mới nhất' : 'A → Z'}
            </Text>
          </TouchableOpacity>

          {/* Level filter */}
          {LEVELS.map((lv) => (
            <Chip
              key={lv}
              active={levelFilter === lv}
              label={lv === 'ALL' ? 'All levels' : lv}
              onPress={() => setLevelFilter(lv)}
            />
          ))}

          {/* File type filter */}
          <Chip
            active={fileFilter === 'all'}
            label="Tất cả loại"
            onPress={() => setFileFilter('all')}
            activeBg="#111827"
            activeText="#fff"
            inactiveBg="#E5E7EB"
            inactiveText="#111827"
          />
          <Chip
            active={fileFilter === 'pdf'}
            label="PDF"
            onPress={() => setFileFilter('pdf')}
          />
          <Chip
            active={fileFilter === 'word'}
            label="Word"
            onPress={() => setFileFilter('word')}
          />
        </ScrollView>
      </View>
    ),
    [insets.top, searchText, sortBy, levelFilter, fileFilter, openEdit],
  );

  const ListEmpty = useCallback(
    () => (
      <View style={{ alignItems: 'center', paddingTop: 48 }}>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <>
            <Ionicons name="file-tray-outline" size={40} color="#9CA3AF" />
            <Text style={{ color: '#6B7280', marginTop: 8 }}>Chưa có tài liệu</Text>
          </>
        )}
      </View>
    ),
    [loading],
  );

  const ListFooter = useCallback(() => {
    if (loading && items.length === 0) return null;
    if (!hasMore) return <View style={{ height: 32 }} />;
    return (
      <View style={{ paddingVertical: 16 }}>
        <ActivityIndicator />
      </View>
    );
  }, [loading, hasMore, items.length]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={ListFooter}
        onEndReachedThreshold={0.3}
        onEndReached={fetchMore}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}
