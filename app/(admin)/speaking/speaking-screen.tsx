// app/(admin)/speaking/speaking-screen.tsx
import { COLORS } from '@/components/style/admin/AdminColors';
import { SpeakingStyles as S } from '@/components/style/admin/speaking/speaking-styles';
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
    Timestamp
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
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


// ======================= TYPES ==========================
type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
type SpeakingType = 'repeat' | 'qa' | 'dialogue' | 'monologue';
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

type SpeakingLesson = {
  id: string;
  title: string;
  prompt?: string;
  sampleAnswer?: string;
  audioUrl?: string;
  level?: CEFR;
  topic?: Topic;
  type?: SpeakingType;
  bandMin?: number;
  bandMax?: number;
  tasksCount?: number;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};


// ======================= CONSTANTS ==========================
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


// ======================= HELPERS ==========================
function formatDate(d?: Date | null) {
  if (!d) return '';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
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
  if (min == null && max == null) return '—';
  if (min != null && max != null) return `${min}–${max}`;
  if (min != null && max == null) return `${min}+`;
  return String(max);
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
      showTitle: true,
      enableBarCollapsing: true,
      enableDefaultShareMenuItem: false,
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
    });
  } catch {
    if (await Linking.canOpenURL(safe)) Linking.openURL(safe);
    else Alert.alert('Không mở được liên kết', safe);
  }
}

function snippet(s?: string, max = 64) {
  if (!s) return '';
  const one = s.replace(/\s+/g, ' ').trim();
  return one.length > max ? one.slice(0, max) + '…' : one;
}

function wordsCount(s?: string) {
  return s ? s.trim().split(/\s+/).filter(Boolean).length : 0;
}


// ======================= MAIN SCREEN ==========================
export default function SpeakingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<SpeakingLesson[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [filterLevel, setFilterLevel] = useState<'ALL' | CEFR>('ALL');
  const [filterTopic, setFilterTopic] = useState<'ALL' | Topic>('ALL');

  const [levelCenter, setLevelCenter] = useState(false);
  const [topicCenter, setTopicCenter] = useState(false);


  // ============== LOAD DATA ==============
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'speaking_lessons'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);

      const data = snap.docs.map((d) => {
        const raw = d.data() as any;
        return {
          id: d.id,
          title: raw.title ?? '(Không tiêu đề)',
          prompt: raw.prompt ?? '',
          sampleAnswer: raw.sampleAnswer ?? '',
          audioUrl: raw.audioUrl ?? '',
          level: (raw.level as CEFR) ?? 'A1',
          topic: (raw.topic as Topic) ?? 'Daily Life',
          type: (raw.type as SpeakingType) ?? 'repeat',
          bandMin: raw.bandMin ?? undefined,
          bandMax: raw.bandMax ?? undefined,
          tasksCount: raw.tasksCount ?? undefined,
          createdAt: raw.createdAt instanceof Timestamp ? raw.createdAt.toDate() : null,
          updatedAt: raw.updatedAt instanceof Timestamp ? raw.updatedAt.toDate() : null,
        };
      });

      setItems(data);
    } catch (e: any) {
      Alert.alert('Lỗi tải dữ liệu', e?.message || 'Không lấy được danh sách Speaking');
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


  // ============== FILTER ITEMS ==============
  const filteredItems = useMemo(() => {
    const t = searchText.trim().toLowerCase();

    return items.filter((it) => {
      const byText =
        !t ||
        it.title.toLowerCase().includes(t) ||
        it.prompt?.toLowerCase().includes(t) ||
        it.sampleAnswer?.toLowerCase().includes(t) ||
        it.audioUrl?.toLowerCase().includes(t) ||
        it.topic?.toLowerCase().includes(t);

      const byLevel = filterLevel === 'ALL' || it.level === filterLevel;
      const byTopic = filterTopic === 'ALL' || it.topic === filterTopic;

      return byText && byLevel && byTopic;
    });
  }, [items, searchText, filterLevel, filterTopic]);



  // ============== ACTIONS ==============
  const onEdit = (id: string) => {
    router.push({ pathname: '/(admin)/speaking/speaking-create', params: { id } });
  };

  const onDelete = (id: string) => {
    Alert.alert(
      'Xoá bài Speaking?',
      'Bạn có chắc muốn xoá bài này vĩnh viễn không?',
      [
        { text: 'Huỷ', style: 'cancel' },
        { text: 'Sửa', onPress: () => onEdit(id) },
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'speaking_lessons', id));
              setItems((prev) => prev.filter((x) => x.id !== id));
            } catch (e: any) {
              Alert.alert('Lỗi xoá', e?.message || 'Không xoá được');
            }
          },
        },
      ]
    );
  };

  const openScript = (item: SpeakingLesson) => {
    const prompt = item.prompt?.trim();
    const sample = item.sampleAnswer?.trim();

    if (!prompt && !sample) {
      Alert.alert('Bài này chưa có script.');
      return;
    }

    Alert.alert(item.title, `${prompt}\n\n---\n${sample}`);
  };


  // ============== RENDER ITEM ==============
  const renderItem = ({ item }: { item: SpeakingLesson }) => {
    const wcPrompt = wordsCount(item.prompt);
    const wcSample = wordsCount(item.sampleAnswer);

    return (
      <View style={S.card}>

        {/* HEADER */}
        <View style={S.cardHeader}>
          <View style={{ flex: 1 }}>
            <View style={S.rowLine}>
              <Ionicons name="mic-outline" size={16} color={COLORS.subText} />
              <Text style={S.rowLabel}>Bài Speaking:</Text>
              <Text style={S.cardTitle} numberOfLines={2}>{item.title}</Text>
            </View>

            <View style={[S.rowLine, { marginTop: 4 }]}>
              <Ionicons name="albums-outline" size={16} color={COLORS.subText} />
              <Text style={S.rowLabel}>Chủ đề:</Text>
              <Text style={S.rowText}>{item.topic}</Text>

              {item.type && (
                <>
                  <Text style={[S.rowLabel, { marginLeft: 8 }]}>Loại:</Text>
                  <Text style={S.rowText}>{item.type}</Text>
                </>
              )}
            </View>

            <View style={[S.rowLine, { marginTop: 4 }]}>
              <Ionicons name="speedometer-outline" size={16} color={COLORS.subText} />
              <Text style={S.rowLabel}>Band:</Text>
              <Text style={S.rowText}>{bandLabel(item.bandMin, item.bandMax)}</Text>

              {item.tasksCount && (
                <>
                  <Text style={[S.rowLabel, { marginLeft: 8 }]}>Số lượt:</Text>
                  <Text style={S.rowText}>{item.tasksCount}</Text>
                </>
              )}
            </View>

            {(item.updatedAt || item.createdAt) && (
              <View style={[S.rowLine, { marginTop: 4 }]}>
                <Ionicons name="calendar-clear-outline" size={16} color={COLORS.subText} />
                <Text style={S.rowLabel}>Cập nhật:</Text>
                <Text style={S.rowText}>{formatDate(item.updatedAt || item.createdAt)}</Text>
              </View>
            )}
          </View>

          <View style={[S.badge, { backgroundColor: colorForLevel(item.level) }]}>
            <Text style={S.badgeText}>{item.level}</Text>
          </View>
        </View>
        {/* PROMPT */}
        {!!item.prompt?.trim() && (
          <View style={S.rowLine}>
            <Ionicons name="chatbox-ellipses-outline" size={16} color={COLORS.link} />
            <Text style={S.rowLabel}>Prompt:</Text>
            <TouchableOpacity onPress={() => openScript(item)} style={{ flex: 1 }}>
              <Text style={S.rowTextLink} numberOfLines={1}>
                {snippet(item.prompt)} {wcPrompt ? `• ${wcPrompt} từ` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* SAMPLE */}
        {!!item.sampleAnswer?.trim() && (
          <View style={S.rowLine}>
            <Ionicons name="checkmark-done-outline" size={16} color={COLORS.subText} />
            <Text style={S.rowLabel}>Sample:</Text>
            <TouchableOpacity onPress={() => openScript(item)} style={{ flex: 1 }}>
              <Text style={S.rowText} numberOfLines={1}>
                {snippet(item.sampleAnswer)} {wcSample ? `• ${wcSample} từ` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* AUDIO */}
        {!!item.audioUrl?.trim() && (
          <View style={S.rowLine}>
            <Ionicons name="musical-notes-outline" size={16} color={COLORS.link} />
            <Text style={S.rowLabel}>Audio:</Text>
            <TouchableOpacity onPress={() => openInApp(item.audioUrl)} style={{ flex: 1 }}>
              <Text style={S.rowTextLink} numberOfLines={1}>{item.audioUrl}</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* ACTIONS */}
        <View style={[S.cardActions, { marginTop: 14 }]}>
          <TouchableOpacity style={S.iconBtn} onPress={() => openScript(item)}>
            <Ionicons name="eye-outline" size={20} color={COLORS.text} />
            <Text style={S.iconBtnText}>Xem script</Text>
          </TouchableOpacity>

          {!!item.audioUrl?.trim() && (
            <TouchableOpacity style={S.iconBtn} onPress={() => openInApp(item.audioUrl)}>
              <Ionicons name="play-circle-outline" size={20} color={COLORS.text} />
              <Text style={S.iconBtnText}>Nghe mẫu</Text>
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
  // ======================= UI ==========================
  return (
    <View style={[S.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={S.header}>
        <TouchableOpacity onPress={() => router.push('/(admin)/home')} style={S.backBtn}>
          <Ionicons name="arrow-back-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={S.headerTitle}>Quản lý Speaking</Text>

        <TouchableOpacity
          onPress={() => router.push('/(admin)/speaking/attempts')}
          style={S.backBtn}
        >
          <Ionicons name="list-circle-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>
      {/* SEARCH */}
      <View style={[S.filterRow, { gap: 8 }]}>
        <View style={[S.searchBox, { flex: 1 }]}>
          <Ionicons name="search-outline" size={18} color={COLORS.muted} style={{ marginRight: 6 }} />
          <TextInput
            placeholder="Tìm theo tiêu đề, prompt, sample, audio…"
            placeholderTextColor={COLORS.muted}
            value={searchText}
            onChangeText={setSearchText}
            style={S.searchInput}
            returnKeyType="search"
            onSubmitEditing={Keyboard.dismiss}
          />
        </View>
      </View>
      {/* FILTER ROW */}
      <View style={[S.filterRow, { gap: 8 }]}>
        {/* LEVEL */}
        <TouchableOpacity onPress={() => setLevelCenter(true)} style={[S.filterPicker, { flex: 1 }]}>
          <Text style={S.filterValueText}>
            {filterLevel === 'ALL' ? 'Level: All' : `Level: ${filterLevel}`}
          </Text>
          <Ionicons name="chevron-down" size={16} color={COLORS.muted} style={S.filterChevron} />
        </TouchableOpacity>

        {/* TOPIC */}
        <TouchableOpacity onPress={() => setTopicCenter(true)} style={[S.filterPicker, { flex: 1 }]}>
          <Text style={S.filterValueText}>
            {filterTopic === 'ALL' ? 'Topic: All' : `Topic: ${filterTopic}`}
          </Text>
          <Ionicons name="chevron-down" size={16} color={COLORS.muted} style={S.filterChevron} />
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: insets.bottom + 70 }}
          ListEmptyComponent={
            <View style={S.emptyWrap}>
              <Text style={S.emptyTitle}>Chưa có bài Speaking</Text>
              <Text style={S.emptyText}>
                Bấm <Text style={S.emptyEm}>+</Text> để tạo bài đầu tiên.
              </Text>
            </View>
          }
        />
      )}
      {/* CREATE FAB */}
      <TouchableOpacity
        onPress={() => router.push('/(admin)/speaking/speaking-create')}
        style={[S.fab, { bottom: 24 + insets.bottom }]}
      >
        <Ionicons name="add-outline" size={28} color={COLORS.bg} />
      </TouchableOpacity>
      {/* ========== MODAL CHỌN LEVEL ========== */}
      <Modal visible={levelCenter} transparent animationType="fade">
        <View style={S.overlayDim}>
          <View style={S.levelDialog}>
            <View style={S.levelHeader}>
              <Text style={S.levelTitle}>Chọn Level</Text>
              <TouchableOpacity onPress={() => setLevelCenter(false)}>
                <Ionicons name="close" size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {LEVELS.map((lv) => {
              const selected = lv === filterLevel;
              return (
                <TouchableOpacity
                  key={lv}
                  style={S.levelItemRow}
                  onPress={() => { setFilterLevel(lv); setLevelCenter(false); }}
                >
                  <Text style={[S.levelItemText, selected && S.levelItemTextSelected]}>
                    {lv === 'ALL' ? 'All' : lv}
                  </Text>
                  {selected && <Ionicons name="checkmark" size={18} color={COLORS.create} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>
      {/* ========== MODAL CHỌN TOPIC ========== */}
      <Modal visible={topicCenter} transparent animationType="fade">
        <View style={S.overlayDim}>
          <View style={S.levelDialog}>
            <View style={S.levelHeader}>
              <Text style={S.levelTitle}>Chọn Topic</Text>
              <TouchableOpacity onPress={() => setTopicCenter(false)}>
                <Ionicons name="close" size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            {TOPICS.map((tp) => {
              const selected = tp === filterTopic;
              return (
                <TouchableOpacity
                  key={tp}
                  style={S.levelItemRow}
                  onPress={() => { setFilterTopic(tp); setTopicCenter(false); }}
                >
                  <Text style={[S.levelItemText, selected && S.levelItemTextSelected]}>
                    {tp === 'ALL' ? 'All' : tp}
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
