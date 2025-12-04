// ===============================
// LISTEN MANAGEMENT SCREEN – CLEAN VERSION 2025 + QUESTIONS BUTTON
// ===============================

import { COLORS, ListenStyles as S } from '@/components/style/admin/listen/listen-screen-styles';
import { db } from '@/scripts/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

import {
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
    updateDoc
} from 'firebase/firestore';

import React, { useCallback, useMemo, useState } from 'react';
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


// =========================
// TYPES
// =========================
type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

type Listen = {
  id: string;
  title: string;
  audioUrl?: string;
  transcript?: string;
  mediaType?: string | null;
  level?: CEFR;
  exerciseFileUrl?: string | null;
  exerciseFileName?: string | null;
  isPublished?: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

const LEVELS: ('ALL' | CEFR)[] = ['ALL', 'A1', 'A2', 'B1', 'B2', 'C1'];


// =========================
// UTILS
// =========================
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
    const can = await Linking.canOpenURL(safe);
    if (can) await Linking.openURL(safe);
  }
}

function transcriptSnippet(s?: string, max = 48) {
  if (!s) return '';
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, max) + '…' : t;
}


// ===============================
// MAIN SCREEN
// ===============================
export default function ListenScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Listen[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterLevel, setFilterLevel] = useState<'ALL' | CEFR>('ALL');

  // Transcript modal
  const [modal, setModal] = useState({
    visible: false,
    id: '',
    title: '',
    content: '',
    editing: false,
  });

  // Level modal
  const [modalLevel, setModalLevel] = useState(false);

  // =========================
  // LOAD DATA
  // =========================
  useFocusEffect(
    useCallback(() => {
      setLoading(true);

      const col = collection(db, 'listens');
      const qy = query(col, orderBy('createdAt', 'desc'));

      const unsub = onSnapshot(qy, (snap) => {
        const list: Listen[] = [];
        snap.forEach((d) => {
          const raw = d.data() as any;
          list.push({
            id: d.id,
            title: raw.title ?? '',
            audioUrl: raw.audioUrl,
            transcript: raw.transcript,
            mediaType: raw.mediaType,
            level: raw.level ?? 'A1',
            exerciseFileUrl: raw.exerciseFileUrl ?? null,
            exerciseFileName: raw.exerciseFileName ?? null,
            isPublished: !!raw.isPublished,
            createdAt: raw.createdAt instanceof Timestamp ? raw.createdAt.toDate() : null,
            updatedAt: raw.updatedAt instanceof Timestamp ? raw.updatedAt.toDate() : null,
          });
        });

        setItems(list);
        setLoading(false);
      });

      return () => unsub();
    }, [])
  );

  // =========================
  // REFRESH
  // =========================
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 400);
  };


  // =========================
  // FILTER + SEARCH
  // =========================
  const filteredItems = useMemo(() => {
    const t = searchText.trim().toLowerCase();
    return items.filter((item) => {
      const matchText =
        item.title.toLowerCase().includes(t) ||
        (item.transcript ?? '').toLowerCase().includes(t) ||
        (item.audioUrl ?? '').toLowerCase().includes(t);

      const matchLevel =
        filterLevel === 'ALL' ? true : item.level === filterLevel;

      return matchText && matchLevel;
    });
  }, [items, searchText, filterLevel]);


  // =========================
  // ACTIONS
  // =========================
  const editListen = (id: string) => {
    router.push({ pathname: '/(admin)/listen/listen-create', params: { id } });
  };

  const gotoQuestions = (id: string) => {
    router.push({
      pathname: '/(admin)/listen/listen-questions/[id]',
      params: { id },
    });
  };

  const deleteListen = (id: string) => {
    Alert.alert('Xoá bài nghe?', 'Hành động này không thể hoàn tác.', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'listens', id));
          } catch (e: any) {
            Alert.alert('Lỗi', e?.message ?? 'Không xoá được');
          }
        },
      },
    ]);
  };

  const togglePublish = async (id: string, next: boolean) => {
    try {
      await updateDoc(doc(db, 'listens', id), {
        isPublished: next,
        updatedAt: serverTimestamp(),
      });
    } catch (e: any) {
      Alert.alert('Lỗi', e?.message ?? 'Không thể publish');
    }
  };

  const changeLevel = async (id: string, next: CEFR) => {
    try {
      await updateDoc(doc(db, 'listens', id), {
        level: next,
        updatedAt: serverTimestamp(),
      });
    } catch (e: any) {
      Alert.alert('Lỗi', e?.message ?? 'Không thể đổi cấp độ');
    }
  };

  const openTranscript = (item: Listen) => {
    if (!item.transcript?.trim()) {
      Alert.alert('Bài này chưa có transcript.');
      return;
    }
    setModal({
      visible: true,
      id: item.id,
      title: item.title,
      content: item.transcript,
      editing: false,
    });
  };

  const saveTranscript = async () => {
    try {
      await updateDoc(doc(db, 'listens', modal.id), {
        transcript: modal.content.trim(),
        updatedAt: serverTimestamp(),
      });
      setModal((p) => ({ ...p, editing: false }));
      Alert.alert('Đã lưu transcript');
    } catch (e: any) {
      Alert.alert('Lỗi', e?.message ?? 'Không lưu được transcript');
    }
  };


  // =========================
  // RENDER ITEM
  // =========================
  const renderItem = ({ item }: { item: Listen }) => {
    const isVideo = (item.mediaType ?? '').startsWith('video');
    const isAudio = (item.mediaType ?? '').startsWith('audio');

    return (
      <View style={S.card}>
        {/* Header */}
        <View style={S.cardHeader}>
          <View style={S.flex1}>
            <Text style={S.cardTitle}>{item.title}</Text>
          </View>

          <View style={S.alignEnd}>
            <View style={[S.badge, { backgroundColor: colorForLevel(item.level) }]}>
              <Text style={S.badgeText}>{item.level}</Text>
            </View>

            <TouchableOpacity
              onPress={() => togglePublish(item.id, !item.isPublished)}
              style={[
                S.badge,
                { marginTop: 6 },
                { backgroundColor: item.isPublished ? '#16a34a' : '#e5e7eb' },
              ]}
            >
              <Text
                style={{
                  color: item.isPublished ? '#fff' : '#111827',
                  fontWeight: '700',
                }}
              >
                {item.isPublished ? 'Published' : 'Unpublished'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dates */}
        {(item.createdAt || item.updatedAt) && (
          <View style={[S.rowLine, { marginTop: 6 }]}>
            <Ionicons name="calendar-clear-outline" size={16} color={COLORS.subText} />
            <Text style={S.rowLabel}>Ngày:</Text>
            {!!item.createdAt && (
              <Text style={S.rowText}>Tạo {formatDate(item.createdAt)}</Text>
            )}
            {!!item.updatedAt && (
              <Text style={[S.rowText, { marginLeft: 8 }]}>
                • Sửa {formatDate(item.updatedAt)}
              </Text>
            )}
          </View>
        )}

        {/* Transcript */}
        {!!item.transcript && (
          <View style={[S.rowLine, { marginTop: 4 }]}>
            <Ionicons name="document-text-outline" size={16} color={COLORS.link} />
            <Text style={S.rowLabel}>Transcript:</Text>

            <TouchableOpacity onPress={() => openTranscript(item)} style={S.flex1}>
              <Text style={S.rowTextLink} numberOfLines={1}>
                {transcriptSnippet(item.transcript)}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Media */}
        {!!item.audioUrl && (
          <View style={[S.rowLine, { marginTop: 4 }]}>
            <Ionicons
              name={isVideo ? 'film-outline' : isAudio ? 'volume-high-outline' : 'link-outline'}
              size={16}
              color={COLORS.link}
            />
            <Text style={S.rowLabel}>Media:</Text>
            <TouchableOpacity onPress={() => openInApp(item.audioUrl)} style={S.flex1}>
              <Text style={S.rowTextLink} numberOfLines={1}>
                {item.audioUrl}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Exercise File */}
        {!!item.exerciseFileUrl && (
          <View style={[S.rowLine, { marginTop: 4 }]}>
            <Ionicons name="document-outline" size={16} color={COLORS.link} />
            <Text style={S.rowLabel}>File:</Text>
            <TouchableOpacity onPress={() => openInApp(item.exerciseFileUrl!)} style={S.flex1}>
              <Text style={S.rowTextLink} numberOfLines={1}>
                {item.exerciseFileName}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Actions */}
        <View style={[S.cardActions, { marginTop: 6 }]}>
          <TouchableOpacity onPress={() => openTranscript(item)} style={S.iconBtn}>
            <Ionicons name="document-outline" size={20} color={COLORS.text} />
            <Text style={S.iconBtnText}>Tài liệu</Text>
          </TouchableOpacity>

          {!!item.audioUrl && (
            <TouchableOpacity onPress={() => openInApp(item.audioUrl)} style={S.iconBtn}>
              <Ionicons
                name={isAudio || isVideo ? 'play-circle-outline' : 'open-outline'}
                size={20}
                color={COLORS.text}
              />
              <Text style={S.iconBtnText}>Nghe</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => editListen(item.id)} style={S.iconBtn}>
            <Ionicons name="create-outline" size={20} color={COLORS.edit} />
            <Text style={[S.iconBtnText, S.textEdit]}>Sửa</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => gotoQuestions(item.id)} style={S.iconBtn}>
            <Ionicons name="help-circle-outline" size={20} color={COLORS.text} />
            <Text style={S.iconBtnText}>Câu hỏi</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => deleteListen(item.id)} style={S.iconBtn}>
            <Ionicons name="trash-outline" size={20} color={COLORS.del} />
            <Text style={[S.iconBtnText, S.textDel]}>Xoá</Text>
          </TouchableOpacity>
        </View>

        {/* Level Quick Picker */}
        <View style={S.levelRow}>
          {(['A1','A2','B1','B2','C1'] as CEFR[]).map((lv) => {
            const active = item.level === lv;
            return (
              <TouchableOpacity
                key={lv}
                style={[S.levelChip, active && S.levelChipActive]}
                onPress={() => changeLevel(item.id, lv)}
              >
                <Text
                  style={[S.levelChipText, active && S.levelChipTextActive]}
                >
                  {lv}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };


  // =========================
  // UI RENDER
  // =========================
  return (
    <View style={[S.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={S.header}>
        <TouchableOpacity
          onPress={() => router.push('/(admin)/home')}
          style={S.backBtn}
        >
          <Ionicons name="arrow-back-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={S.headerTitle}>Quản lý Listen</Text>
        <View style={S.headerSpacer} />
      </View>

      {/* Search + Filter */}
      <View style={S.filterRow}>
        <View style={S.searchBox}>
          <Ionicons name="search-outline" size={18} color={COLORS.muted} />
          <TextInput
            placeholder="Tìm theo tiêu đề, transcript, link…"
            placeholderTextColor={COLORS.muted}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={Keyboard.dismiss}
            style={S.searchInput}
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity onPress={() => setModalLevel(true)} style={S.filterPicker}>
          <Text style={S.filterValueText}>
            {filterLevel === 'ALL' ? 'All' : filterLevel}
          </Text>
          <Ionicons name="chevron-down" size={16} color={COLORS.muted} />
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator style={S.spinner} color={COLORS.create} />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={[
            S.listContent,
            { paddingBottom: insets.bottom + 24 },
          ]}
          ListEmptyComponent={
            <View style={S.emptyWrap}>
              <Text style={S.emptyTitle}>Chưa có bài nghe</Text>
              <Text style={S.emptyText}>
                Bấm <Text style={S.emptyEm}>+</Text> để tạo bài nghe đầu tiên.
              </Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[S.fab, { bottom: 24 + insets.bottom }]}
        onPress={() => router.push('/(admin)/listen/listen-create')}
      >
        <Ionicons name="add-outline" size={28} color={COLORS.bg} />
      </TouchableOpacity>

      {/* Transcript modal */}
      <Modal
        visible={modal.visible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setModal((p) => ({ ...p, visible: false }))
        }
      >
        <View style={S.overlayCenter}>
          <View style={S.dialog}>
            <TouchableOpacity
              onPress={() => setModal((p) => ({ ...p, visible: false }))}
              style={S.closeBtn}
            >
              <Ionicons name="close" size={20} color={COLORS.text} />
            </TouchableOpacity>

            <Text style={S.modalTitle}>{modal.title}</Text>

            <ScrollView style={S.modalBody}>
              {modal.editing ? (
                <TextInput
                  multiline
                  value={modal.content}
                  onChangeText={(t) => setModal((p) => ({ ...p, content: t }))}
                  style={S.modalInput}
                  placeholder="Nhập transcript…"
                />
              ) : (
                <Text style={S.modalText}>{modal.content}</Text>
              )}
            </ScrollView>

            <View style={S.modalActions}>
              {!modal.editing ? (
                <TouchableOpacity
                  onPress={() =>
                    setModal((p) => ({ ...p, editing: true }))
                  }
                  style={[S.iconBtn, S.editBtnBg]}
                >
                  <Ionicons name="create-outline" size={20} color={COLORS.text} />
                  <Text style={S.iconBtnText}>Sửa</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={saveTranscript}
                  style={[S.iconBtn, S.saveBtnBg]}
                >
                  <Ionicons name="save-outline" size={20} color={COLORS.bg} />
                  <Text style={[S.iconBtnText, S.saveBtnText]}>Lưu</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Level modal */}
<Modal visible={modalLevel} transparent animationType="fade">
  <View style={[S.overlayDim, S.modalFixWeb]}>
    <View style={[S.levelDialog, S.modalInnerFix]}>
      <Text style={S.levelTitle}>Chọn cấp độ</Text>

      {LEVELS.map((lv) => {
        const active = filterLevel === lv;
        return (
          <TouchableOpacity
            key={lv}
            onPress={() => {
              setFilterLevel(lv);
              setModalLevel(false);
            }}
            style={S.levelItemRow}
          >
            <Text
              style={[
                S.levelItemText,
                active && S.levelItemTextSelected,
              ]}
            >
              {lv}
            </Text>
            {active && (
              <Ionicons name="checkmark" size={18} color={COLORS.create} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
</Modal>

    </View>
  );
}
