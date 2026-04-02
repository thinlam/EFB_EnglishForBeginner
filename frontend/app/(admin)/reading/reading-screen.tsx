import { ReadingScreenStyles as S } from '@/components/style/admin/reading/reading-screen-styles';
import { COLORS } from '@/components/style/colors/AppColors';
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

/* TYPES */
type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
type ReadingType =
  | 'story'
  | 'news'
  | 'email'
  | 'notice'
  | 'ad'
  | 'blog'
  | 'dialogue'
  | 'instruction';

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
  type?: ReadingType;
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

/* Utils */
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
    default: return '#9ca3af';
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
    await WebBrowser.openBrowserAsync(safe);
  } catch {
    const ok = await Linking.canOpenURL(safe);
    if (ok) Linking.openURL(safe);
  }
}

function snippet(s?: string, max = 64) {
  if (!s) return '';
  const oneline = s.replace(/\s+/g, ' ').trim();
  return oneline.length > max ? oneline.slice(0, max) + '…' : oneline;
}

function wordsCount(s?: string) {
  if (!s) return 0;
  return s.trim().split(/\s+/).filter(Boolean).length;
}

/* MAIN COMPONENT */
export default function ReadingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Reading[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [filterLevel, setFilterLevel] = useState<'ALL' | CEFR>('ALL');
  const [filterTopic, setFilterTopic] = useState<'ALL' | Topic>('ALL');

  const [docModal, setDocModal] = useState({
    visible: false,
    id: undefined as string | undefined,
    title: '',
    content: '',
    editing: false,
  });

  const [levelCenter, setLevelCenter] = useState(false);
  const [topicCenter, setTopicCenter] = useState(false);

  /* LOAD DATA */
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'readings'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);

      setItems(
        snap.docs.map((d) => {
          const raw = d.data() as any;
          return {
            id: d.id,
            title: raw.title ?? '(Không tiêu đề)',
            passage: raw.passage ?? '',
            sourceUrl: raw.sourceUrl ?? '',
            level: raw.level ?? 'A1',
            topic: raw.topic ?? 'Daily Life',
            type: raw.type ?? 'story',
            bandMin: raw.bandMin,
            bandMax: raw.bandMax,
            questionsCount: raw.questionsCount,
            createdAt:
              raw.createdAt instanceof Timestamp ? raw.createdAt.toDate() : null,
            updatedAt:
              raw.updatedAt instanceof Timestamp ? raw.updatedAt.toDate() : null,
          };
        })
      );
    } catch (e) {
      Alert.alert('Lỗi load dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const filteredItems = useMemo(() => {
    const txt = searchText.trim().toLowerCase();
    return items.filter((it) => {
      const matchText =
        !txt ||
        it.title.toLowerCase().includes(txt) ||
        (it.passage ?? '').toLowerCase().includes(txt) ||
        (it.sourceUrl ?? '').toLowerCase().includes(txt) ||
        (it.topic ?? '').toLowerCase().includes(txt);

      const matchLevel = filterLevel === 'ALL' || it.level === filterLevel;
      const matchTopic = filterTopic === 'ALL' || it.topic === filterTopic;

      return matchText && matchLevel && matchTopic;
    });
  }, [items, searchText, filterLevel, filterTopic]);

  /* ACTIONS */
  const openPassage = (item: Reading) => {
    if (!item.passage?.trim()) {
      Alert.alert('Bài đọc trống');
      return;
    }
    setDocModal({
      visible: true,
      id: item.id,
      title: item.title,
      content: item.passage,
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
      Alert.alert('Đã lưu bài đọc');
    } catch {
      Alert.alert('Lỗi lưu bài đọc');
    }
  };

  const renderItem = ({ item }: { item: Reading }) => {
    const wc = wordsCount(item.passage);

    return (
      <View style={S.card}>
        {/* Header */}
        <View style={S.cardHeader}>
          <View style={{ flex: 1 }}>
            <View style={S.rowLine}>
              <Ionicons name="book-outline" size={16} color={COLORS.subText} />
              <Text style={S.rowLabel}>Tiêu đề:</Text>
              <Text style={S.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>
            </View>
          </View>

          <View
            style={[
              S.badge,
              { backgroundColor: colorForLevel(item.level) },
            ]}
          >
            <Text style={S.badgeText}>{item.level}</Text>
          </View>
        </View>

        {/* Topic */}
        <View style={S.rowLine}>
          <Ionicons name="albums-outline" size={16} color={COLORS.subText} />
          <Text style={S.rowLabel}>Chủ đề:</Text>
          <Text style={S.rowText}>{item.topic}</Text>
        </View>

        {/* Band + Questions */}
        <View style={S.rowLine}>
          <Ionicons name="speedometer-outline" size={16} color={COLORS.subText} />
          <Text style={S.rowLabel}>Band:</Text>
          <Text style={S.rowText}>{bandLabel(item.bandMin, item.bandMax)}</Text>

          {item.questionsCount && (
            <>
              <Text style={S.rowLabel}>Câu hỏi:</Text>
              <Text style={S.rowText}>{item.questionsCount}</Text>
            </>
          )}
        </View>

        {/* Date */}
        {item.updatedAt && (
          <View style={S.rowLine}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={COLORS.subText}
            />
            <Text style={S.rowLabel}>Cập nhật:</Text>
            <Text style={S.rowText}>{formatDate(item.updatedAt)}</Text>
          </View>
        )}

        {/* Passage */}
        {item.passage?.trim() && (
          <View style={S.rowLine}>
            <Ionicons name="document-text-outline" size={16} color={COLORS.link} />
            <Text style={S.rowLabel}>Bài đọc:</Text>
            <TouchableOpacity onPress={() => openPassage(item)} style={{ flex: 1 }}>
              <Text style={S.rowTextLink} numberOfLines={1}>
                {snippet(item.passage)} • {wc} từ
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* SOURCE LINK */}
        {!!item.sourceUrl?.trim() && (
          <View style={S.rowLine}>
            <Ionicons name="link-outline" size={16} color={COLORS.link} />
            <Text style={S.rowLabel}>Nguồn:</Text>
            <TouchableOpacity onPress={() => openInApp(item.sourceUrl)} style={{ flex: 1 }}>
              <Text style={S.rowTextLink} numberOfLines={1}>
                {item.sourceUrl}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ACTION BUTTONS */}
        <View style={S.cardActions}>
          <TouchableOpacity style={S.iconBtn} onPress={() => openPassage(item)}>
            <Ionicons name="eye-outline" size={20} color={COLORS.text} />
            <Text style={S.iconBtnText}>Xem bài</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={S.iconBtn}
            onPress={() =>
              router.push({
                pathname: '/(admin)/reading/reading-questions',
                params: { id: item.id, title: item.title },
              })
            }
          >
            <Ionicons name="help-circle-outline" size={20} color={COLORS.text} />
            <Text style={S.iconBtnText}>Câu hỏi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={S.iconBtn}
            onPress={() =>
              router.push({
                pathname: '/(admin)/reading/reading-create',
                params: { id: item.id },
              })
            }
          >
            <Ionicons name="create-outline" size={20} color={COLORS.edit} />
            <Text style={[S.iconBtnText, { color: COLORS.edit }]}>Sửa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={S.iconBtn}
            onPress={() =>
              deleteDoc(doc(db, 'readings', item.id)).then(loadData)
            }
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.del} />
            <Text style={[S.iconBtnText, { color: COLORS.del }]}>Xoá</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /* RENDER MAIN */
  return (
    <View style={[S.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={S.header}>
        <TouchableOpacity
          onPress={() => router.push('/(admin)/home')}
          style={S.backBtn}
        >
          <Ionicons name="arrow-back-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={S.headerTitle}>Quản lý Reading</Text>

        <View style={{ width: 24 }} />
      </View>

      {/* SEARCH BAR */}
      <View style={S.filterRow}>
        <View style={S.searchBox}>
          <Ionicons name="search-outline" size={18} color={COLORS.muted} />
          <TextInput
            placeholder="Tìm theo tiêu đề, bài đọc, link, chủ đề…"
            placeholderTextColor={COLORS.muted}
            value={searchText}
            onChangeText={setSearchText}
            style={S.searchInput}
            onSubmitEditing={Keyboard.dismiss}
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* FILTER ROW */}
      <View style={S.filterRow}>
        {/* LEVEL */}
        <TouchableOpacity style={S.filterPicker} onPress={() => setLevelCenter(true)}>
          <Text style={S.filterValueText}>
            {filterLevel === 'ALL' ? 'Level: All' : `Level: ${filterLevel}`}
          </Text>
          <Ionicons name="chevron-down" size={16} color={COLORS.muted} />
        </TouchableOpacity>

        {/* TOPIC */}
        <TouchableOpacity style={[S.filterPicker, { marginLeft: 8 }]} onPress={() => setTopicCenter(true)}>
          <Text style={S.filterValueText}>
            {filterTopic === 'ALL' ? 'Topic: All' : `Topic: ${filterTopic}`}
          </Text>
          <Ionicons name="chevron-down" size={16} color={COLORS.muted} />
        </TouchableOpacity>
      </View>

      {/* LIST */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.create} />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadData} />
          }
          ListEmptyComponent={
            <View style={S.emptyWrap}>
              <Text style={S.emptyTitle}>Chưa có bài đọc</Text>
              <Text style={S.emptyText}>
                Bấm <Text style={S.emptyEm}>+</Text> để tạo bài đọc đầu tiên
              </Text>
            </View>
          }
        />
      )}

      {/* FLOATING ADD BUTTON */}
      <TouchableOpacity
        style={[S.fab, { bottom: 24 + insets.bottom }]}
        onPress={() => router.push('/(admin)/reading/reading-create')}
      >
        <Ionicons name="add-outline" size={28} color={COLORS.bg} />
      </TouchableOpacity>

      {/* ===================== MODALS ===================== */}

      {/* VIEW / EDIT PASSAGE */}
      <Modal visible={docModal.visible} transparent animationType="fade">
        <TouchableWithoutFeedback
          onPress={() => setDocModal((p) => ({ ...p, visible: false }))}
        >
          <View style={S.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={S.modalBox}>
                {/* CLOSE */}
                <TouchableOpacity
                  style={S.modalCloseBtn}
                  onPress={() =>
                    setDocModal((p) => ({ ...p, visible: false }))
                  }
                >
                  <Ionicons name="close" size={18} color={COLORS.text} />
                </TouchableOpacity>

                {/* HEADER */}
                <View style={S.modalHeader}>
                  <Text style={S.modalTitle}>{docModal.title}</Text>
                </View>

                {/* CONTENT */}
                {docModal.editing ? (
                  <ScrollView style={S.modalScroll}>
                    <TextInput
                      multiline
                      value={docModal.content}
                      onChangeText={(t) =>
                        setDocModal((p) => ({ ...p, content: t }))
                      }
                      style={S.modalInput}
                    />
                  </ScrollView>
                ) : (
                  <ScrollView style={S.modalScroll}>
                    <Text style={S.modalText}>{docModal.content}</Text>
                  </ScrollView>
                )}

                {/* FOOTER */}
                <View style={S.modalFooter}>
                  {!docModal.editing ? (
                    <TouchableOpacity
                      style={S.iconBtn}
                      onPress={() =>
                        setDocModal((p) => ({ ...p, editing: true }))
                      }
                    >
                      <Ionicons name="create-outline" size={20} color={COLORS.text} />
                      <Text style={S.iconBtnText}>Chỉnh sửa</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={S.iconBtn} onPress={savePassage}>
                      <Ionicons name="save-outline" size={20} color={COLORS.text} />
                      <Text style={S.iconBtnText}>Lưu</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* LEVEL PICKER */}
      <Modal visible={levelCenter} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setLevelCenter(false)}>
          <View style={S.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={S.pickerBox}>
                <View style={S.pickerHeader}>
                  <Text style={S.pickerHeaderText}>Chọn cấp độ</Text>
                </View>

                {LEVELS.map((lv) => {
                  const selected = filterLevel === lv;
                  return (
                    <TouchableOpacity
                      key={lv}
                      style={S.pickerItem}
                      onPress={() => {
                        setFilterLevel(lv);
                        setLevelCenter(false);
                      }}
                    >
                      <Text
                        style={[
                          S.pickerItemText,
                          selected && { fontWeight: '700', color: COLORS.create },
                        ]}
                      >
                        {lv === 'ALL' ? 'All' : lv}
                      </Text>

                      {selected && (
                        <Ionicons
                          name="checkmark"
                          size={18}
                          color={COLORS.create}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* TOPIC PICKER */}
      <Modal visible={topicCenter} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setTopicCenter(false)}>
          <View style={S.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[S.pickerBox, { width: 300 }]}>
                <View style={S.pickerHeader}>
                  <Text style={S.pickerHeaderText}>Chọn chủ đề</Text>
                </View>

                {TOPICS.map((tp) => {
                  const selected = filterTopic === tp;
                  return (
                    <TouchableOpacity
                      key={tp}
                      style={S.pickerItem}
                      onPress={() => {
                        setFilterTopic(tp);
                        setTopicCenter(false);
                      }}
                    >
                      <Text
                        style={[
                          S.pickerItemText,
                          selected && { fontWeight: '700', color: COLORS.create },
                        ]}
                      >
                        {tp === 'ALL' ? 'All' : tp}
                      </Text>

                      {selected && (
                        <Ionicons
                          name="checkmark"
                          size={18}
                          color={COLORS.create}
                        />
                      )}
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
