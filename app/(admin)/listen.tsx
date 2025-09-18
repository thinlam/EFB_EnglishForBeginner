import { COLORS, ListenStyles as S } from '@/components/style/ListenStyles';
import { db } from '@/scripts/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
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
  mediaType?: string | null;
  level?: CEFR;
  createdAt?: Date | null;
};

const LEVELS: ('ALL' | CEFR)[] = ['ALL', 'A1', 'A2', 'B1', 'B2', 'C1'];

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

function normalizeUrl(raw?: string) {
  if (!raw) return '';
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

async function openInApp(url?: string) {
  if (!url) return;
  const safe = normalizeUrl(url);
  try {
    await WebBrowser.openBrowserAsync(safe, {
      enableBarCollapsing: true,
      showTitle: true,
      enableDefaultShareMenuItem: false,
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
    });
  } catch {
    const can = await Linking.canOpenURL(safe);
    if (can) await Linking.openURL(safe);
    else Alert.alert('Không mở được liên kết', safe);
  }
}

function transcriptSnippet(s?: string, max = 48) {
  if (!s) return '';
  const oneLine = s.replace(/\s+/g, ' ').trim();
  return oneLine.length > max ? oneLine.slice(0, max) + '…' : oneLine;
}

export default function ListenScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Listen[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterLevel, setFilterLevel] = useState<'ALL' | CEFR>('ALL');

  // Modal transcript (đặt giữa, có X, cho phép sửa & lưu)
  const [docModal, setDocModal] = useState<{
    visible: boolean;
    id?: string;
    title: string;
    content: string;
    editing: boolean;
  }>({ visible: false, id: undefined, title: '', content: '', editing: false });

  // Modal chọn cấp độ (đặt giữa)
  const [levelCenter, setLevelCenter] = useState(false);

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

  const onEdit = (id: string) => {
    router.push({ pathname: '/(admin)/ListenCreate', params: { id } });
  };

  const onDelete = (id: string) => {
    Alert.alert('Bạn muốn làm gì?', 'Sửa nội dung hay xoá hẳn bài này?', [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Sửa', onPress: () => onEdit(id) },
      {
        text: 'Xoá hẳn',
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

  const openTranscript = (item: Listen) => {
    const content = (item.transcript || '').trim();
    if (!content) {
      Alert.alert('Chưa có nội dung tài liệu');
      return;
    }
    setDocModal({
      visible: true,
      id: item.id,
      title: item.title || 'Tài liệu',
      content,
      editing: false,
    });
  };

  const saveTranscript = async () => {
    if (!docModal.id) return;
    try {
      await updateDoc(doc(db, 'listens', docModal.id), {
        transcript: docModal.content.trim(),
        updatedAt: serverTimestamp(),
      });
      // Cập nhật local list nhanh
      setItems((prev) =>
        prev.map((it) =>
          it.id === docModal.id ? { ...it, transcript: docModal.content } : it
        )
      );
      setDocModal((p) => ({ ...p, editing: false }));
      Alert.alert('Đã lưu', 'Cập nhật tài liệu thành công.');
    } catch (e: any) {
      console.error(e);
      Alert.alert('Lỗi', e?.message ?? 'Không thể lưu tài liệu');
    }
  };

  const renderItem = ({ item }: { item: Listen }) => {
    const isVideo = (item.mediaType ?? '').toLowerCase().startsWith('video');
    const isAudio = (item.mediaType ?? '').toLowerCase().startsWith('audio');

    return (
      <View style={S.card}>
        {/* Chủ đề + CEFR */}
        <View style={S.cardHeader}>
          <View style={{ flex: 1 }}>
            <View style={S.rowLine}>
              <Ionicons name="bookmark-outline" size={16} color={COLORS.subText} />
              <Text style={S.rowLabel}>Chủ đề:</Text>
              <Text style={S.cardTitle} numberOfLines={2}>{item.title}</Text>
            </View>
          </View>
          <View style={[S.badge, { backgroundColor: colorForLevel(item.level) }]}>
            <Text style={S.badgeText}>{item.level ?? '—'}</Text>
          </View>
        </View>

        {/* Ngày cập nhật */}
        {item.createdAt && (
          <View style={[S.rowLine, { marginTop: 6 }]}>
            <Ionicons name="calendar-clear-outline" size={16} color={COLORS.subText} />
            <Text style={S.rowLabel}>Ngày cập nhật:</Text>
            <Text style={S.rowText}>{formatDate(item.createdAt)}</Text>
          </View>
        )}

        {/* Tài liệu (Transcript) */}
        {!!item.transcript?.trim() && (
          <View style={S.rowLine}>
            <Ionicons name="document-text-outline" size={16} color={COLORS.link} />
            <Text style={S.rowLabel}>Tài liệu:</Text>
            <TouchableOpacity onPress={() => openTranscript(item)} activeOpacity={0.7} style={{ flex: 1 }}>
              <Text style={S.rowTextLink} numberOfLines={1}>
                {transcriptSnippet(item.transcript)}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Link nghe */}
        {!!item.audioUrl?.trim() && (
          <View style={S.rowLine}>
            {isVideo ? (
              <Ionicons name="film-outline" size={16} color={COLORS.link} />
            ) : isAudio ? (
              <Ionicons name="volume-high-outline" size={16} color={COLORS.link} />
            ) : (
              <Ionicons name="link-outline" size={16} color={COLORS.link} />
            )}
            <Text style={S.rowLabel}>Link nghe:</Text>
            <TouchableOpacity onPress={() => openInApp(item.audioUrl)} activeOpacity={0.7} style={{ flex: 1 }}>
              <Text style={S.rowTextLink} numberOfLines={1}>{item.audioUrl}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Actions: một hàng ngang */}
        <View style={[S.cardActions, { flexWrap: 'nowrap', justifyContent: 'flex-start', gap: 12 }]}>
          <TouchableOpacity style={S.iconBtn} onPress={() => openTranscript(item)}>
            <Ionicons name="document-outline" size={20} color={COLORS.text} />
            <Text style={S.iconBtnText}>Tài liệu</Text>
          </TouchableOpacity>

          {!!item.audioUrl?.trim() && (
            <TouchableOpacity style={S.iconBtn} onPress={() => openInApp(item.audioUrl)}>
              <Ionicons
                name={(isAudio || isVideo) ? 'play-circle-outline' : 'open-outline'}
                size={20}
                color={COLORS.text}
              />
              <Text style={S.iconBtnText}>Nghe</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={S.iconBtn} onPress={() => onEdit(item.id)}>
            <Ionicons name="create-outline" size={20} color={COLORS.edit} />
            <Text style={[S.iconBtnText, { color: COLORS.edit }]}>Sửa</Text>
          </TouchableOpacity>

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
        <TouchableOpacity onPress={() => router.push('/(admin)/home')} style={S.backBtn} activeOpacity={0.7}>
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

        {/* Nút mở modal cấp độ – bấm ở bất kỳ chỗ nào trong ô cũng mở */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setLevelCenter(true)}
          style={S.filterPicker}
        >
          <Text style={S.filterValueText}>{filterLevel === 'ALL' ? 'All' : filterLevel}</Text>
          <Ionicons name="chevron-down" size={16} color={COLORS.muted} style={S.filterChevron} />
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.create} />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
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
          ListFooterComponent={<View style={{ height: 84 + insets.bottom }} />}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[S.fab, { bottom: 24 + insets.bottom }]}
        onPress={() => router.push('/(admin)/ListenCreate')}
        activeOpacity={0.85}
      >
        <Ionicons name="add-outline" size={28} color={COLORS.bg} />
      </TouchableOpacity>

      {/* Modal transcript — Ở GIỮA + nút X + Chỉnh sửa/Lưu */}
      <Modal
        visible={docModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setDocModal((p) => ({ ...p, visible: false }))}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <View
            style={{
              width: '92%',
              maxWidth: 520,
              maxHeight: '80%',
              backgroundColor: COLORS.card,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: COLORS.borderSoft,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Close X */}
            <TouchableOpacity
              onPress={() => setDocModal((p) => ({ ...p, visible: false }))}
              style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, padding: 6, borderRadius: 10, backgroundColor: COLORS.card2, borderWidth: 1, borderColor: COLORS.borderSoft }}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <Ionicons name="close" size={18} color={COLORS.text} />
            </TouchableOpacity>

            <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
              <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: '700' }} numberOfLines={2}>
                {docModal.title || 'Tài liệu'}
              </Text>
            </View>

            {docModal.editing ? (
              <ScrollView style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
                <TextInput
                  multiline
                  value={docModal.content}
                  onChangeText={(t) => setDocModal((p) => ({ ...p, content: t }))}
                  style={{
                    color: COLORS.text,
                    backgroundColor: COLORS.card2,
                    borderWidth: 1,
                    borderColor: COLORS.borderSoft,
                    borderRadius: 10,
                    padding: 12,
                    minHeight: 160,
                    textAlignVertical: 'top',
                  }}
                  placeholder="Nhập nội dung tài liệu…"
                  placeholderTextColor={COLORS.muted}
                />
              </ScrollView>
            ) : (
              <ScrollView style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
                <Text style={{ color: COLORS.subText, fontSize: 14, lineHeight: 22 }}>
                  {docModal.content}
                </Text>
              </ScrollView>
            )}

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, padding: 12, borderTopWidth: 1, borderTopColor: COLORS.border }}>
              {!docModal.editing ? (
                <TouchableOpacity
                  style={[S.iconBtn, { backgroundColor: COLORS.card2 }]}
                  onPress={() => setDocModal((p) => ({ ...p, editing: true }))}
                >
                  <Ionicons name="create-outline" size={20} color={COLORS.text} />
                  <Text style={S.iconBtnText}>Chỉnh sửa</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[S.iconBtn, { backgroundColor: COLORS.create, borderColor: COLORS.border }]}
                  onPress={saveTranscript}
                  activeOpacity={0.9}
                >
                  <Ionicons name="save-outline" size={20} color={COLORS.bg} />
                  <Text style={[S.iconBtnText, { color: COLORS.bg }]}>Lưu</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal chọn cấp độ — Ở GIỮA */}
      <Modal
        visible={levelCenter}
        transparent
        animationType="fade"
        onRequestClose={() => setLevelCenter(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <View
            style={{
              width: 260,
              backgroundColor: COLORS.card,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: COLORS.borderSoft,
              overflow: 'hidden',
            }}
          >
            <View style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
              <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: '700' }}>Chọn cấp độ</Text>
            </View>

            {LEVELS.map((lv) => {
              const label = lv === 'ALL' ? 'All' : lv;
              const selected = filterLevel === lv;
              return (
                <TouchableOpacity
                  key={lv}
                  activeOpacity={0.9}
                  onPress={() => { setFilterLevel(lv); setLevelCenter(false); }}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottomWidth: 1,
                    borderBottomColor: COLORS.borderSoft,
                  }}
                >
                  <Text style={{ color: COLORS.text, fontSize: 15, fontWeight: selected ? '700' : '500' }}>
                    {label}
                  </Text>
                  {selected && <Ionicons name="checkmark" size={18} color={COLORS.create} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>
    </View>
  );
}
