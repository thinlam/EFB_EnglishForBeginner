// app/(admin)/reading/reading-screen.tsx
import { COLORS } from '@/components/style/admin/AdminColors';
import { ReadingStyles as S } from '@/components/style/admin/reading/reading-styles';
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
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
type ReadingType = 'story' | 'news' | 'email' | 'notice' | 'ad' | 'blog' | 'dialogue' | 'instruction';
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
  type?: ReadingType; // vẫn giữ trong dữ liệu nhưng không hiển thị/lọc
  bandMin?: number;
  bandMax?: number;
  questionsCount?: number;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

const LEVELS: ('ALL' | CEFR)[] = ['ALL', 'A1', 'A2', 'B1', 'B2', 'C1'];
const TOPICS: ('ALL' | Topic)[] = [
  'ALL',
  'Work & Office',
  'Travel & Transport',
  'Daily Life',
  'Shopping & Service',
  'Education',
  'Technology',
  'Entertainment',
  'Health & Food',
  'Business',
];

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

function bandLabel(min?: number, max?: number) {
  if (!min && !max) return '—';
  if (min && max) return `${min}–${max}`;
  if (min && !max) return `${min}+`;
  return `${max}`;
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

function snippet(s?: string, max = 64) {
  if (!s) return '';
  const oneLine = s.replace(/\s+/g, ' ').trim();
  return oneLine.length > max ? oneLine.slice(0, max) + '…' : oneLine;
}

function wordsCount(s?: string) {
  if (!s) return 0;
  return s.trim().split(/\s+/).filter(Boolean).length;
}

export default function ReadingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Reading[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [filterLevel, setFilterLevel] = useState<'ALL' | CEFR>('ALL');
  const [filterTopic, setFilterTopic] = useState<'ALL' | Topic>('ALL');

  const [docModal, setDocModal] = useState<{
    visible: boolean;
    id?: string;
    title: string;
    content: string;
    editing: boolean;
  }>({ visible: false, id: undefined, title: '', content: '', editing: false });

  const [levelCenter, setLevelCenter] = useState(false);
  const [topicCenter, setTopicCenter] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'readings'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data: Reading[] = snap.docs.map((d) => {
        const raw = d.data() as any;
        return {
          id: d.id,
          title: raw.title ?? '(Không tiêu đề)',
          passage: raw.passage ?? '',
          sourceUrl: raw.sourceUrl ?? '',
          level: (raw.level as CEFR) ?? 'A1',
          topic: (raw.topic as Topic) ?? 'Daily Life',
          type: (raw.type as ReadingType) ?? 'story',
          bandMin: typeof raw.bandMin === 'number' ? raw.bandMin : undefined,
          bandMax: typeof raw.bandMax === 'number' ? raw.bandMax : undefined,
          questionsCount: typeof raw.questionsCount === 'number' ? raw.questionsCount : undefined,
          createdAt: raw.createdAt instanceof Timestamp ? raw.createdAt.toDate() : null,
          updatedAt: raw.updatedAt instanceof Timestamp ? raw.updatedAt.toDate() : null,
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
        (it.passage ?? '').toLowerCase().includes(text) ||
        (it.sourceUrl ?? '').toLowerCase().includes(text) ||
        (it.topic ?? '').toLowerCase().includes(text);
        // Loại (type) không còn được dùng để tìm

      const matchLevel = filterLevel === 'ALL' ? true : it.level === filterLevel;
      const matchTopic = filterTopic === 'ALL' ? true : it.topic === filterTopic;

      return matchText && matchLevel && matchTopic;
    });
  }, [items, searchText, filterLevel, filterTopic]);

  const onEdit = (id: string) => {
    router.push({ pathname: '/(admin)/reading/reading-create', params: { id } });
  };

  const onDelete = (id: string) => {
    Alert.alert('Bạn muốn làm gì?', 'Sửa nội dung hay xoá hẳn bài đọc này?', [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Sửa', onPress: () => onEdit(id) },
      {
        text: 'Xoá hẳn',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'readings', id));
            setItems((prev) => prev.filter((i) => i.id !== id));
          } catch (e: any) {
            console.error(e);
            Alert.alert('Lỗi', e?.message ?? 'Không xoá được');
          }
        },
      },
    ]);
  };

  const openPassage = (item: Reading) => {
    const content = (item.passage || '').trim();
    if (!content) {
      Alert.alert('Chưa có nội dung bài đọc');
      return;
    }
    setDocModal({
      visible: true,
      id: item.id,
      title: item.title || 'Bài đọc',
      content,
      editing: false,
    });
  };

  const savePassage = async () => {
    if (!docModal.id) return;
    try {
      await updateDoc(doc(db, 'readings', docModal.id), {
        passage: docModal.content.trim(),
        updatedAt: serverTimestamp(),
      });
      setItems((prev) =>
        prev.map((it) =>
          it.id === docModal.id ? { ...it, passage: docModal.content } : it
        )
      );
      setDocModal((p) => ({ ...p, editing: false }));
      Alert.alert('Đã lưu', 'Cập nhật bài đọc thành công.');
    } catch (e: any) {
      console.error(e);
      Alert.alert('Lỗi', e?.message ?? 'Không thể lưu bài đọc');
    }
  };

  const renderItem = ({ item }: { item: Reading }) => {
    const wc = wordsCount(item.passage);

    return (
      <View style={S.card}>
        <View style={S.cardHeader}>
          <View style={{ flex: 1 }}>
            <View style={S.rowLine}>
              <Ionicons name="book-outline" size={16} color={COLORS.subText} />
              <Text style={S.rowLabel}>Tiêu đề:</Text>
              <Text style={S.cardTitle} numberOfLines={2}>{item.title}</Text>
            </View>
          </View>
          <View style={[S.badge, { backgroundColor: colorForLevel(item.level) }]}>
            <Text style={S.badgeText}>{item.level ?? '—'}</Text>
          </View>
        </View>

        <View style={[S.rowLine, { marginTop: 6 }]}>
          <Ionicons name="albums-outline" size={16} color={COLORS.subText} />
          <Text style={S.rowLabel}>Chủ đề:</Text>
          <Text style={S.rowText}>{item.topic ?? '—'}</Text>
        </View>

        <View style={[S.rowLine, { marginTop: 4 }]}>
          <Ionicons name="speedometer-outline" size={16} color={COLORS.subText} />
          <Text style={S.rowLabel}>Band:</Text>
          <Text style={S.rowText}>{bandLabel(item.bandMin, item.bandMax)}</Text>
          {!!item.questionsCount && (
            <>
              <Text style={[S.rowLabel, { marginLeft: 8 }]}>Câu hỏi:</Text>
              <Text style={S.rowText}>{item.questionsCount}</Text>
            </>
          )}
        </View>

        {(item.updatedAt || item.createdAt) && (
          <View style={[S.rowLine, { marginTop: 4 }]}>
            <Ionicons name="calendar-clear-outline" size={16} color={COLORS.subText} />
            <Text style={S.rowLabel}>Cập nhật:</Text>
            <Text style={S.rowText}>
              {formatDate(item.updatedAt || item.createdAt)}
            </Text>
          </View>
        )}

        {!!item.passage?.trim() && (
          <View style={S.rowLine}>
            <Ionicons name="document-text-outline" size={16} color={COLORS.link} />
            <Text style={S.rowLabel}>Bài đọc:</Text>
            <TouchableOpacity onPress={() => openPassage(item)} activeOpacity={0.7} style={{ flex: 1 }}>
              <Text style={S.rowTextLink} numberOfLines={1}>
                {snippet(item.passage)} {wc ? `• ${wc} từ` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!!item.sourceUrl?.trim() && (
          <View style={S.rowLine}>
            <Ionicons name="link-outline" size={16} color={COLORS.link} />
            <Text style={S.rowLabel}>Nguồn:</Text>
            <TouchableOpacity onPress={() => openInApp(item.sourceUrl)} activeOpacity={0.7} style={{ flex: 1 }}>
              <Text style={S.rowTextLink} numberOfLines={1}>{item.sourceUrl}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={[S.cardActions, { flexWrap: 'nowrap', justifyContent: 'flex-start', gap: 12 }]}>
          <TouchableOpacity style={S.iconBtn} onPress={() => openPassage(item)}>
            <Ionicons name="eye-outline" size={20} color={COLORS.text} />
            <Text style={S.iconBtnText}>Xem bài</Text>
          </TouchableOpacity>

          {!!item.sourceUrl?.trim() && (
            <TouchableOpacity style={S.iconBtn} onPress={() => openInApp(item.sourceUrl)}>
              <Ionicons name="open-outline" size={20} color={COLORS.text} />
              <Text style={S.iconBtnText}>Mở nguồn</Text>
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

      <View style={S.header}>
        <TouchableOpacity onPress={() => router.push('/(admin)/home')} style={S.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={S.headerTitle}>Quản lý Reading</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* SEARCH ROW (hàng 1) */}
      <View style={[S.filterRow, { gap: 8 }]}>
        <View style={[S.searchBox, { flex: 1 }]}>
          <Ionicons name="search-outline" size={18} color={COLORS.muted} style={{ marginRight: 6 }} />
          <TextInput
            placeholder="Tìm theo tiêu đề, bài đọc, link, chủ đề…"
            placeholderTextColor={COLORS.muted}
            value={searchText}
            onChangeText={setSearchText}
            style={S.searchInput}
            returnKeyType="search"
            onSubmitEditing={Keyboard.dismiss}
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* FILTER ROW (hàng 2: Level + Topic) */}
      <View style={[S.filterRow, { gap: 8 }]}>
        <TouchableOpacity activeOpacity={0.9} onPress={() => setLevelCenter(true)} style={[S.filterPicker, { flex: 1 }]}>
          <Text style={S.filterValueText}>{filterLevel === 'ALL' ? 'Level: All' : `Level: ${filterLevel}`}</Text>
          <Ionicons name="chevron-down" size={16} color={COLORS.muted} style={S.filterChevron} />
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.9} onPress={() => setTopicCenter(true)} style={[S.filterPicker, { flex: 1 }]}>
          <Text style={S.filterValueText}>{filterTopic === 'ALL' ? 'Topic: All' : `Topic: ${filterTopic}`}</Text>
          <Ionicons name="chevron-down" size={16} color={COLORS.muted} style={S.filterChevron} />
        </TouchableOpacity>
      </View>

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
              <Text style={S.emptyTitle}>Chưa có bài đọc</Text>
              <Text style={S.emptyText}>
                Bấm <Text style={S.emptyEm}>+</Text> để tạo bài đọc đầu tiên.
              </Text>
            </View>
          }
          renderItem={renderItem}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={<View style={{ height: 84 + insets.bottom }} />}
        />
      )}

      <TouchableOpacity
        style={[S.fab, { bottom: 24 + insets.bottom }]}
        onPress={() => router.push('/(admin)/reading/reading-create')}
        activeOpacity={0.85}
      >
        <Ionicons name="add-outline" size={28} color={COLORS.bg} />
      </TouchableOpacity>

      {/* DOC MODAL (tap outside to close) */}
      <Modal
        visible={docModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setDocModal((p) => ({ ...p, visible: false }))}
      >
        <TouchableWithoutFeedback onPress={() => setDocModal((p) => ({ ...p, visible: false }))}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
            <TouchableWithoutFeedback onPress={() => {}}>
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
                <TouchableOpacity
                  onPress={() => setDocModal((p) => ({ ...p, visible: false }))}
                  style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, padding: 6, borderRadius: 10, backgroundColor: COLORS.card2, borderWidth: 1, borderColor: COLORS.borderSoft }}
                  hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                >
                  <Ionicons name="close" size={18} color={COLORS.text} />
                </TouchableOpacity>

                <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
                  <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: '700' }} numberOfLines={2}>
                    {docModal.title || 'Bài đọc'}
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
                      placeholder="Nhập nội dung bài đọc…"
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
                      onPress={savePassage}
                      activeOpacity={0.9}
                    >
                      <Ionicons name="save-outline" size={20} color={COLORS.bg} />
                      <Text style={[S.iconBtnText, { color: COLORS.bg }]}>Lưu</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* LEVEL PICKER (tap outside to close) */}
      <Modal
        visible={levelCenter}
        transparent
        animationType="fade"
        onRequestClose={() => setLevelCenter(false)}
      >
        <TouchableWithoutFeedback onPress={() => setLevelCenter(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
            <TouchableWithoutFeedback onPress={() => {}}>
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
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* TOPIC PICKER (tap outside to close) */}
      <Modal
        visible={topicCenter}
        transparent
        animationType="fade"
        onRequestClose={() => setTopicCenter(false)}
      >
        <TouchableWithoutFeedback onPress={() => setTopicCenter(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View
                style={{
                  width: 300,
                  backgroundColor: COLORS.card,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: COLORS.borderSoft,
                  overflow: 'hidden',
                }}
              >
                <View style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
                  <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: '700' }}>Chọn chủ đề</Text>
                </View>

                {TOPICS.map((tp) => {
                  const label = tp === 'ALL' ? 'All' : tp;
                  const selected = filterTopic === tp;
                  return (
                    <TouchableOpacity
                      key={tp}
                      activeOpacity={0.9}
                      onPress={() => { setFilterTopic(tp); setTopicCenter(false); }}
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
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
