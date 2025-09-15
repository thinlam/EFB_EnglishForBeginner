
import { COLORS, ListenStyles as S } from '@/components/style/ListenStyles';
import { db } from '@/scripts/firebase';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  Linking,
  Platform,
  RefreshControl,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
type Listen = {
  id: string;
  title: string;
  audioUrl?: string;
  transcript?: string;
  mediaType?: string | null; // "audio/*" | "video/*" | null
  level?: CEFR;
  createdAt?: Date | null;
};

function formatDate(d?: Date | null) {
  if (!d) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function colorForLevel(l?: string) {
  switch (l) {
    case 'A1': return '#22c55e';
    case 'A2': return '#10b981';
    case 'B1': return '#06b6d4';
    case 'B2': return '#60a5fa';
    case 'C1': return '#a78bfa';
    default:   return '#9ca3af';
  }
}

export default function ListenScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Listen[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [filterLevel, setFilterLevel] = useState<'ALL' | CEFR>('ALL');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'listens'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data: Listen[] = snap.docs.map((d) => {
        const raw = d.data() as any;
        return {
          id: d.id,
          title: raw.title ?? '(Không tiêu đề)',
          audioUrl: raw.audioUrl ?? '',
          transcript: raw.transcript ?? '',
          mediaType: raw.mediaType ?? null,
          level: (raw.level as CEFR) ?? 'A1',
          createdAt: raw.createdAt instanceof Timestamp ? raw.createdAt.toDate() : null,
        };
      });
      setItems(data);
    } catch (e: any) {
      console.error(e);
      Alert.alert('Lỗi', e?.message ?? 'Không tải được danh sách');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredItems = useMemo(() => {
    const text = searchText.trim().toLowerCase();
    return items.filter((it) => {
      const matchText =
        !text ||
        it.title.toLowerCase().includes(text) ||
        (it.transcript ?? '').toLowerCase().includes(text) ||
        (it.audioUrl ?? '').toLowerCase().includes(text);

      const matchLevel = filterLevel === 'ALL' ? true : it.level === filterLevel;
      return matchText && matchLevel;
    });
  }, [items, searchText, filterLevel]);

  const openLink = async (rawUrl?: string) => {
    if (!rawUrl) return;
    try {
      const url = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
      const can = await Linking.canOpenURL(url);
      if (can) await Linking.openURL(url);
      else Alert.alert('Không mở được link', url);
    } catch (e: any) {
      Alert.alert('Lỗi', e?.message ?? 'Không mở được link');
    }
  };

  const onDelete = (id: string) => {
    Alert.alert('Xoá bài nghe', 'Bạn có chắc muốn xoá?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'listens', id));
            setItems((prev) => prev.filter((i) => i.id !== id));
          } catch (e: any) {
            console.error(e);
            Alert.alert('Lỗi', e?.message ?? 'Không xoá được');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Listen }) => {
    const isVideo = (item.mediaType ?? '').toLowerCase().startsWith('video');
    const isAudio = (item.mediaType ?? '').toLowerCase().startsWith('audio');

    return (
      <View style={S.card}>
        {/* Header: Title + CEFR badge */}
        <View style={S.cardHeader}>
          <Text style={S.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={[S.badge, { backgroundColor: colorForLevel(item.level) }]}>
            <Text style={S.badgeText}>{item.level ?? '—'}</Text>
          </View>
        </View>

        {/* Date (icon tách khỏi text) */}
        {item.createdAt && (
          <View style={[S.rowLine, { marginTop: 6 }]}>
            <Ionicons name="calendar-clear-outline" size={16} color={COLORS.subText} />
            <Text style={S.rowText}>{formatDate(item.createdAt)}</Text>
          </View>
        )}

        {/* Source link (icon tách riêng, chỉ text là link) */}
        {!!item.audioUrl && (
          <View style={S.rowLine}>
            {isVideo ? (
              <Ionicons name="film-outline" size={16} color={COLORS.link} />
            ) : isAudio ? (
              <Ionicons name="volume-high-outline" size={16} color={COLORS.link} />
            ) : (
              <Ionicons name="link-outline" size={16} color={COLORS.link} />
            )}

            <TouchableOpacity
              onPress={() => openLink(item.audioUrl)}
              activeOpacity={0.7}
              style={{ flex: 1 }} // link chiếm phần còn lại, không lệch
            >
              <Text style={S.rowTextLink} numberOfLines={1}>
                {item.audioUrl}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Transcript / note (icon tách rời) */}
        {!!item.transcript && (
          <View style={S.rowLine}>
            <Ionicons name="document-text-outline" size={16} color={COLORS.subText} />
            <Text style={S.cardTranscript} numberOfLines={2}>
              {item.transcript}
            </Text>
          </View>
        )}

        {/* Actions */}
        <View style={S.cardActions}>
          <TouchableOpacity style={S.iconBtn} onPress={() => openLink(item.audioUrl)}>
            <Ionicons
              name={isAudio || isVideo ? 'play-circle-outline' : 'open-outline'}
              size={20}
              color={COLORS.text}
            />
            <Text style={S.iconBtnText}>{isAudio || isVideo ? 'Nghe' : 'Mở'}</Text>
          </TouchableOpacity>

          <View style={{ flex: 1 }} />

          <TouchableOpacity style={S.iconBtn} onPress={() => onDelete(item.id)}>
            <Ionicons name="trash-outline" size={20} color={COLORS.del} />
            <Text style={[S.iconBtnText, { color: COLORS.del }]}>Xoá</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[S.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={S.header}>
        <TouchableOpacity
          onPress={() => router.push('/(admin)/home')}
          style={S.backBtn}
          activeOpacity={0.7}
        >
          {/* Mũi tên “dài” như ảnh mẫu */}
          <Ionicons name="arrow-back-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={S.headerTitle}>Quản lý Listen</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Search + Filter */}
      <View style={S.filterRow}>
        <View style={S.searchBox}>
          <Ionicons name="search-outline" size={18} color={COLORS.muted} style={{ marginRight: 6 }} />
          <TextInput
            placeholder="Tìm theo tiêu đề, transcript, link…"
            placeholderTextColor={COLORS.muted}
            value={searchText}
            onChangeText={setSearchText}
            style={S.searchInput}
            returnKeyType="search"
            onSubmitEditing={Keyboard.dismiss}
            autoCapitalize="none"
          />
        </View>

        {/* Picker custom */}
        <View style={S.filterPicker}>
          <Text style={S.filterValueText}>{filterLevel === 'ALL' ? 'All' : filterLevel}</Text>
          <Ionicons name="chevron-down" size={16} color={COLORS.muted} style={S.filterChevron} />
          <Picker
            selectedValue={filterLevel}
            onValueChange={(value) => setFilterLevel(value as 'ALL' | CEFR)}
            mode={Platform.OS === 'ios' ? 'dialog' : 'dropdown'}
            style={S.hiddenPicker}
            dropdownIconColor={COLORS.muted}
          >
            <Picker.Item label="All" value="ALL" />
            <Picker.Item label="A1" value="A1" />
            <Picker.Item label="A2" value="A2" />
            <Picker.Item label="B1" value="B1" />
            <Picker.Item label="B2" value="B2" />
            <Picker.Item label="C1" value="C1" />
          </Picker>
        </View>
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.create} />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={
            <View style={S.emptyWrap}>
              <Text style={S.emptyTitle}>Chưa có bài nghe</Text>
              <Text style={S.emptyText}>
                Bấm <Text style={S.emptyEm}>+</Text> để tạo bài nghe đầu tiên.
              </Text>
            </View>
          }
          renderItem={renderItem}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={S.fab}
        onPress={() => router.push('/(admin)/ListenCreate')}
        activeOpacity={0.85}
      >
        <Ionicons name="add-outline" size={28} color={COLORS.bg} />
      </TouchableOpacity>
    </View>
  );
}
