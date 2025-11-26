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
  RefreshControl,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  prompt?: string;        // Đề bài / câu hỏi / câu cần nói
  sampleAnswer?: string;  // Gợi ý câu trả lời / script mẫu
  audioUrl?: string;      // File audio mẫu (Cloudinary / Firebase)
  level?: CEFR;
  topic?: Topic;
  type?: SpeakingType;
  bandMin?: number;
  bandMax?: number;
  tasksCount?: number;    // số câu / số lượt nói trong bài
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
    case 'A1':
      return '#22c55e';
    case 'A2':
      return '#10b981';
    case 'B1':
      return '#06b6d4';
    case 'B2':
      return '#60a5fa';
    case 'C1':
      return '#a78bfa';
    default:
      return '#9ca3af';
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
  return s
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export default function SpeakingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<SpeakingLesson[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [filterLevel, setFilterLevel] = useState<'ALL' | CEFR>('ALL');
  const [filterTopic, setFilterTopic] = useState<'ALL' | Topic>('ALL');

  const [scriptModal, setScriptModal] = useState<{
    visible: boolean;
    id?: string;
    title: string;
    prompt: string;
    sampleAnswer: string;
    editing: boolean;
  }>({
    visible: false,
    id: undefined,
    title: '',
    prompt: '',
    sampleAnswer: '',
    editing: false,
  });

  const [levelCenter, setLevelCenter] = useState(false);
  const [topicCenter, setTopicCenter] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'speaking_lessons'),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      const data: SpeakingLesson[] = snap.docs.map((d) => {
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
          bandMin:
            typeof raw.bandMin === 'number' ? raw.bandMin : undefined,
          bandMax:
            typeof raw.bandMax === 'number' ? raw.bandMax : undefined,
          tasksCount:
            typeof raw.tasksCount === 'number' ? raw.tasksCount : undefined,
          createdAt:
            raw.createdAt instanceof Timestamp
              ? raw.createdAt.toDate()
              : null,
          updatedAt:
            raw.updatedAt instanceof Timestamp
              ? raw.updatedAt.toDate()
              : null,
        };
      });
      setItems(data);
    } catch (e: any) {
      console.error(e);
      Alert.alert('Lỗi', e?.message ?? 'Không tải được danh sách Speaking');
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
        (it.prompt ?? '').toLowerCase().includes(text) ||
        (it.sampleAnswer ?? '').toLowerCase().includes(text) ||
        (it.audioUrl ?? '').toLowerCase().includes(text) ||
        (it.topic ?? '').toLowerCase().includes(text);

      const matchLevel =
        filterLevel === 'ALL' ? true : it.level === filterLevel;
      const matchTopic =
        filterTopic === 'ALL' ? true : it.topic === filterTopic;

      return matchText && matchLevel && matchTopic;
    });
  }, [items, searchText, filterLevel, filterTopic]);

  const onEdit = (id: string) => {
    router.push({
      pathname: '/(admin)/speaking/speaking-create',
      params: { id },
    });
  };

  const onDelete = (id: string) => {
    Alert.alert(
      'Bạn muốn làm gì?',
      'Sửa bài nói hay xoá hẳn bài Speaking này?',
      [
        { text: 'Huỷ', style: 'cancel' },
        { text: 'Sửa', onPress: () => onEdit(id) },
        {
          text: 'Xoá hẳn',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'speaking_lessons', id));
              setItems((prev) => prev.filter((i) => i.id !== id));
            } catch (e: any) {
              console.error(e);
              Alert.alert('Lỗi', e?.message ?? 'Không xoá được');
            }
          },
        },
      ]
    );
  };

  const openScript = (item: SpeakingLesson) => {
    const prompt = (item.prompt || '').trim();
    const sample = (item.sampleAnswer || '').trim();
    if (!prompt && !sample) {
      Alert.alert('Chưa có nội dung script Speaking');
      return;
    }
    setScriptModal({
      visible: true,
      id: item.id,
      title: item.title || 'Bài Speaking',
      prompt,
      sampleAnswer: sample,
      editing: false,
    });
  };

  const saveScript = async () => {
    if (!scriptModal.id) return;
    try {
      await updateDoc(doc(db, 'speaking_lessons', scriptModal.id), {
        prompt: scriptModal.prompt.trim(),
        sampleAnswer: scriptModal.sampleAnswer.trim(),
        updatedAt: serverTimestamp(),
      });
      setItems((prev) =>
        prev.map((it) =>
          it.id === scriptModal.id
            ? {
                ...it,
                prompt: scriptModal.prompt,
                sampleAnswer: scriptModal.sampleAnswer,
              }
            : it
        )
      );
      setScriptModal((p) => ({ ...p, editing: false }));
      Alert.alert('Đã lưu', 'Cập nhật script Speaking thành công.');
    } catch (e: any) {
      console.error(e);
      Alert.alert('Lỗi', e?.message ?? 'Không thể lưu script');
    }
  };

  const renderItem = ({ item }: { item: SpeakingLesson }) => {
    const wcPrompt = wordsCount(item.prompt);
    const wcSample = wordsCount(item.sampleAnswer);

    return (
      <View style={S.card}>
        <View style={S.cardHeader}>
          <View style={{ flex: 1 }}>
            <View style={S.rowLine}>
              <Ionicons
                name="mic-outline"
                size={16}
                color={COLORS.subText}
              />
              <Text style={S.rowLabel}>Bài Speaking:</Text>
              <Text style={S.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>
            </View>

            <View style={[S.rowLine, { marginTop: 4 }]}>
              <Ionicons
                name="albums-outline"
                size={16}
                color={COLORS.subText}
              />
              <Text style={S.rowLabel}>Chủ đề:</Text>
              <Text style={S.rowText}>{item.topic ?? '—'}</Text>
              {!!item.type && (
                <>
                  <Text
                    style={[S.rowLabel, { marginLeft: 8 }]}
                  >
                    Loại:
                  </Text>
                  <Text style={S.rowText}>{item.type}</Text>
                </>
              )}
            </View>

            <View style={[S.rowLine, { marginTop: 4 }]}>
              <Ionicons
                name="speedometer-outline"
                size={16}
                color={COLORS.subText}
              />
              <Text style={S.rowLabel}>Band:</Text>
              <Text style={S.rowText}>
                {bandLabel(item.bandMin, item.bandMax)}
              </Text>
              {!!item.tasksCount && (
                <>
                  <Text
                    style={[S.rowLabel, { marginLeft: 8 }]}
                  >
                    Số lượt nói:
                  </Text>
                  <Text style={S.rowText}>{item.tasksCount}</Text>
                </>
              )}
            </View>

            {(item.updatedAt || item.createdAt) && (
              <View style={[S.rowLine, { marginTop: 4 }]}>
                <Ionicons
                  name="calendar-clear-outline"
                  size={16}
                  color={COLORS.subText}
                />
                <Text style={S.rowLabel}>Cập nhật:</Text>
                <Text style={S.rowText}>
                  {formatDate(item.updatedAt || item.createdAt)}
                </Text>
              </View>
            )}
          </View>

          <View
            style={[
              S.badge,
              { backgroundColor: colorForLevel(item.level) },
            ]}
          >
            <Text style={S.badgeText}>{item.level ?? '—'}</Text>
          </View>
        </View>

        {!!item.prompt?.trim() && (
          <View style={S.rowLine}>
            <Ionicons
              name="chatbox-ellipses-outline"
              size={16}
              color={COLORS.link}
            />
            <Text style={S.rowLabel}>Prompt:</Text>
            <TouchableOpacity
              onPress={() => openScript(item)}
              activeOpacity={0.7}
              style={{ flex: 1 }}
            >
              <Text style={S.rowTextLink} numberOfLines={1}>
                {snippet(item.prompt)}{' '}
                {wcPrompt ? `• ${wcPrompt} từ` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!!item.sampleAnswer?.trim() && (
          <View style={S.rowLine}>
            <Ionicons
              name="checkmark-done-outline"
              size={16}
              color={COLORS.subText}
            />
            <Text style={S.rowLabel}>Sample:</Text>
            <TouchableOpacity
              onPress={() => openScript(item)}
              activeOpacity={0.7}
              style={{ flex: 1 }}
            >
              <Text style={S.rowText} numberOfLines={1}>
                {snippet(item.sampleAnswer)}{' '}
                {wcSample ? `• ${wcSample} từ` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!!item.audioUrl?.trim() && (
          <View style={S.rowLine}>
            <Ionicons
              name="musical-notes-outline"
              size={16}
              color={COLORS.link}
            />
            <Text style={S.rowLabel}>Audio mẫu:</Text>
            <TouchableOpacity
              onPress={() => openInApp(item.audioUrl)}
              activeOpacity={0.7}
              style={{ flex: 1 }}
            >
              <Text style={S.rowTextLink} numberOfLines={1}>
                {item.audioUrl}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View
          style={[
            S.cardActions,
            {
              flexWrap: 'nowrap',
              justifyContent: 'flex-start',
              gap: 12,
            },
          ]}
        >
          <TouchableOpacity
            style={S.iconBtn}
            onPress={() => openScript(item)}
          >
            <Ionicons
              name="eye-outline"
              size={20}
              color={COLORS.text}
            />
            <Text style={S.iconBtnText}>Xem script</Text>
          </TouchableOpacity>

          {!!item.audioUrl?.trim() && (
            <TouchableOpacity
              style={S.iconBtn}
              onPress={() => openInApp(item.audioUrl)}
            >
              <Ionicons
                name="play-circle-outline"
                size={20}
                color={COLORS.text}
              />
              <Text style={S.iconBtnText}>Nghe mẫu</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={S.iconBtn}
            onPress={() => onEdit(item.id)}
          >
            <Ionicons
              name="create-outline"
              size={20}
              color={COLORS.edit}
            />
            <Text
              style={[S.iconBtnText, { color: COLORS.edit }]}
            >
              Sửa
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={S.iconBtn}
            onPress={() => onDelete(item.id)}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color={COLORS.del}
            />
            <Text
              style={[S.iconBtnText, { color: COLORS.del }]}
            >
              Xoá
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[S.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={S.header}>
        <TouchableOpacity
          onPress={() => router.push('/(admin)/home')}
          style={S.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back-outline"
            size={22}
            color={COLORS.text}
          />
        </TouchableOpacity>

        <Text style={S.headerTitle}>Quản lý Speaking</Text>

        {/* Nút chuyển sang màn LIST bài nói học viên */}
        <TouchableOpacity
          onPress={() => router.push('/(admin)/speaking/attempts')}
          style={S.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons
            name="list-circle-outline"
            size={22}
            color={COLORS.text}
          />
        </TouchableOpacity>
      </View>

      {/* SEARCH ROW */}
      <View style={[S.filterRow, { gap: 8 }]}>
        <View style={[S.searchBox, { flex: 1 }]}>
          <Ionicons
            name="search-outline"
            size={18}
            color={COLORS.muted}
            style={{ marginRight: 6 }}
          />
          <TextInput
            placeholder="Tìm theo tiêu đề, prompt, sample, audio…"
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

      {/* FILTER ROW: Level + Topic */}
      <View style={[S.filterRow, { gap: 8 }]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setLevelCenter(true)}
          style={[S.filterPicker, { flex: 1 }]}
        >
          <Text style={S.filterValueText}>
            {filterLevel === 'ALL'
              ? 'Level: All'
              : `Level: ${filterLevel}`}
          </Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color={COLORS.muted}
            style={S.filterChevron}
          />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setTopicCenter(true)}
          style={[S.filterPicker, { flex: 1 }]}
        >
          <Text style={S.filterValueText}>
            {filterTopic === 'ALL'
              ? 'Topic: All'
              : `Topic: ${filterTopic}`}
          </Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color={COLORS.muted}
            style={S.filterChevron}
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          style={{ marginTop: 40 }}
          color={COLORS.create}
        />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          contentContainerStyle={{
            paddingBottom: insets.bottom + 24,
          }}
          ListEmptyComponent={
            <View style={S.emptyWrap}>
              <Text style={S.emptyTitle}>Chưa có bài Speaking</Text>
              <Text style={S.emptyText}>
                Bấm <Text style={S.emptyEm}>+</Text> để tạo bài
                Speaking đầu tiên.
              </Text>
            </View>
          }
          renderItem={renderItem}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={
            <View style={{ height: 84 + insets.bottom }} />
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[S.fab, { bottom: 24 + insets.bottom }]}
        onPress={() =>
          router.push('/(admin)/speaking/speaking-create')
        }
        activeOpacity={0.85}
      >
        <Ionicons name="add-outline" size={28} color={COLORS.bg} />
      </TouchableOpacity>

      {/* SCRIPT MODAL */}
      {/* ... phần modal script, level picker, topic picker giữ nguyên như em đang có ... */}
      {/* (đã nằm ngay dưới đây trong file của em, anh không cắt đi) */}

      {/* LEVEL PICKER */}
      {/* (code modal levelCenter & topicCenter giữ nguyên như em paste ở trên) */}
      {/* Anh chỉ sửa mỗi header, còn lại y chang. */}
    </View>
  );
}
