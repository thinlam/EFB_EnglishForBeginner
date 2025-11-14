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

type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
type Listen = {
  id: string;
  title: string;
  audioUrl?: string;
  transcript?: string;
  mediaType?: string | null;
  level?: CEFR;
  isPublished?: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
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

  // Modal transcript
  const [docModal, setDocModal] = useState<{
    visible: boolean;
    id?: string;
    title: string;
    content: string;
    editing: boolean;
  }>({ visible: false, id: undefined, title: '', content: '', editing: false });

  // Modal chọn cấp độ
  const [levelCenter, setLevelCenter] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      const col = collection(db, 'listens');
      const qy = query(col, orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(
        qy,
        snap => {
          const next: Listen[] = [];
          snap.forEach(d => {
            const raw = d.data() as any;
            next.push({
              id: d.id,
              title: raw.title ?? '(Không tiêu đề)',
              audioUrl: raw.audioUrl ?? '',
              transcript: raw.transcript ?? '',
              mediaType: raw.mediaType ?? null,
              level: (raw.level as CEFR) ?? 'A1',
              isPublished: !!raw.isPublished,
              createdAt: raw.createdAt instanceof Timestamp ? raw.createdAt.toDate() : null,
              updatedAt: raw.updatedAt instanceof Timestamp ? raw.updatedAt.toDate() : null,
            });
          });
          setItems(next);
          setLoading(false);
        },
        err => {
          console.error(err);
          Alert.alert('Lỗi', err?.message ?? 'Không tải được danh sách');
          setLoading(false);
        }
      );
      return () => unsub();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 400);
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
    router.push({ pathname: '/(admin)/listen/listen-create', params: { id } });
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
      setDocModal((p) => ({ ...p, editing: false }));
      Alert.alert('Đã lưu', 'Cập nhật tài liệu thành công.');
    } catch (e: any) {
      console.error(e);
      Alert.alert('Lỗi', e?.message ?? 'Không thể lưu tài liệu');
    }
  };

  const togglePublish = async (id: string, next: boolean) => {
    try {
      await updateDoc(doc(db, 'listens', id), {
        isPublished: next,
        updatedAt: serverTimestamp(),
      });
    } catch (e: any) {
      console.error(e);
      Alert.alert('Lỗi', e?.message ?? 'Không thể cập nhật publish');
    }
  };

  const changeLevel = async (id: string, nextLevel: CEFR) => {
    try {
      await updateDoc(doc(db, 'listens', id), {
        level: nextLevel,
        updatedAt: serverTimestamp(),
      });
    } catch (e: any) {
      console.error(e);
      Alert.alert('Lỗi', e?.message ?? 'Không thể đổi level');
    }
  };

  const renderItem = ({ item }: { item: Listen }) => {
    const isVideo = (item.mediaType ?? '').toLowerCase().startsWith('video');
    const isAudio = (item.mediaType ?? '').toLowerCase().startsWith('audio');

    return (
      <View style={S.card}>
        {/* Header: Chủ đề + CEFR + Publish chip */}
        <View style={S.cardHeader}>
          <View style={S.flex1}>
            <View style={S.rowLine}>
              <Ionicons name="bookmark-outline" size={16} color={COLORS.subText} />
              <Text style={S.rowLabel}>Chủ đề:</Text>
              <Text style={S.cardTitle} numberOfLines={2}>{item.title}</Text>
            </View>
          </View>

          <View style={S.alignEnd}>
            <View style={[S.badge, { backgroundColor: colorForLevel(item.level) }]}>
              <Text style={S.badgeText}>{item.level ?? '—'}</Text>
            </View>
            <TouchableOpacity
              onPress={() => togglePublish(item.id, !item.isPublished)}
              style={[S.badge, S.mt6, { backgroundColor: item.isPublished ? '#16a34a' : '#e5e7eb' }]}
            >
              <Text style={[S.badgeText, { color: item.isPublished ? '#fff' : '#111827' }]}>
                {item.isPublished ? 'Published' : 'Unpublished'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ngày tạo / cập nhật */}
        {(item.createdAt || item.updatedAt) && (
          <View style={[S.rowLine, S.mt6]}>
            <Ionicons name="calendar-clear-outline" size={16} color={COLORS.subText} />
            <Text style={S.rowLabel}>Ngày:</Text>
            {!!item.createdAt && <Text style={S.rowText}>Tạo {formatDate(item.createdAt)}</Text>}
            {!!item.updatedAt && <Text style={[S.rowText, S.ml8]}>• Sửa {formatDate(item.updatedAt)}</Text>}
          </View>
        )}

        {/* Tài liệu (Transcript) */}
        {!!item.transcript?.trim() && (
          <View style={S.rowLine}>
            <Ionicons name="document-text-outline" size={16} color={COLORS.link} />
            <Text style={S.rowLabel}>Tài liệu:</Text>
            <TouchableOpacity onPress={() => openTranscript(item)} activeOpacity={0.7} style={S.flex1}>
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
            <TouchableOpacity onPress={() => openInApp(item.audioUrl)} activeOpacity={0.7} style={S.flex1}>
              <Text style={S.rowTextLink} numberOfLines={1}>{item.audioUrl}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Actions */}
        <View style={[S.cardActions, S.actionsTight]}>
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
            <Text style={[S.iconBtnText, S.textEdit]}>Sửa</Text>
          </TouchableOpacity>

          <TouchableOpacity style={S.iconBtn} onPress={() => onDelete(item.id)}>
            <Ionicons name="trash-outline" size={20} color={COLORS.del} />
            <Text style={[S.iconBtnText, S.textDel]}>Xoá</Text>
          </TouchableOpacity>
        </View>

        {/* Quick level picker */}
        <View style={S.levelRow}>
          {(['A1','A2','B1','B2','C1'] as CEFR[]).map(lv => {
            const active = item.level === lv;
            return (
              <TouchableOpacity
                key={lv}
                onPress={() => changeLevel(item.id, lv)}
                style={[S.levelChip, active && S.levelChipActive]}
              >
                <Text style={[S.levelChipText, active && S.levelChipTextActive]}>{lv}</Text>
              </TouchableOpacity>
            );
          })}
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
        <View style={S.headerSpacer} />
      </View>

      {/* Search + Filter */}
      <View style={S.filterRow}>
        <View style={S.searchBox}>
          <Ionicons name="search-outline" size={18} color={COLORS.muted} style={S.mr6} />
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

        {/* Nút mở modal cấp độ */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => setLevelCenter(true)} style={S.filterPicker}>
          <Text style={S.filterValueText}>{filterLevel === 'ALL' ? 'All' : filterLevel}</Text>
          <Ionicons name="chevron-down" size={16} color={COLORS.muted} style={S.filterChevron} />
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator style={S.spinner} color={COLORS.create} />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={[S.listContent, { paddingBottom: insets.bottom + 24 }]}
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
        onPress={() => router.push('/(admin)/listen/listen-create')}
        activeOpacity={0.85}
      >
        <Ionicons name="add-outline" size={28} color={COLORS.bg} />
      </TouchableOpacity>

      {/* Modal transcript */}
      <Modal
        visible={docModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setDocModal((p) => ({ ...p, visible: false }))}
      >
        <View style={S.overlayCenter}>
          <View style={S.dialog}>
            {/* Close X */}
            <TouchableOpacity
              onPress={() => setDocModal((p) => ({ ...p, visible: false }))}
              style={S.closeBtn}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <Ionicons name="close" size={18} color={COLORS.text} />
            </TouchableOpacity>

            <View style={S.modalHeader}>
              <Text style={S.modalTitle} numberOfLines={2}>
                {docModal.title || 'Tài liệu'}
              </Text>
            </View>

            {docModal.editing ? (
              <ScrollView style={S.modalBody}>
                <TextInput
                  multiline
                  value={docModal.content}
                  onChangeText={(t) => setDocModal((p) => ({ ...p, content: t }))}
                  style={S.modalInput}
                  placeholder="Nhập nội dung tài liệu…"
                  placeholderTextColor={COLORS.muted}
                />
              </ScrollView>
            ) : (
              <ScrollView style={S.modalBody}>
                <Text style={S.modalText}>
                  {docModal.content}
                </Text>
              </ScrollView>
            )}

            <View style={S.modalActions}>
              {!docModal.editing ? (
                <TouchableOpacity style={[S.iconBtn, S.editBtnBg]} onPress={() => setDocModal((p) => ({ ...p, editing: true }))}>
                  <Ionicons name="create-outline" size={20} color={COLORS.text} />
                  <Text style={S.iconBtnText}>Chỉnh sửa</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[S.iconBtn, S.saveBtnBg]}
                  onPress={saveTranscript}
                  activeOpacity={0.9}
                >
                  <Ionicons name="save-outline" size={20} color={COLORS.bg} />
                  <Text style={[S.iconBtnText, S.saveBtnText]}>Lưu</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal chọn cấp độ */}
      <Modal
        visible={levelCenter}
        transparent
        animationType="fade"
        onRequestClose={() => setLevelCenter(false)}
      >
        <View style={S.overlayDim}>
          <View style={S.levelDialog}>
            <View style={S.levelHeader}>
              <Text style={S.levelTitle}>Chọn cấp độ</Text>
            </View>

            {LEVELS.map((lv) => {
              const label = lv === 'ALL' ? 'All' : lv;
              const selected = filterLevel === lv;
              return (
                <TouchableOpacity
                  key={lv}
                  activeOpacity={0.9}
                  onPress={() => { setFilterLevel(lv); setLevelCenter(false); }}
                  style={S.levelItemRow}
                >
                  <Text style={[S.levelItemText, selected && S.levelItemTextSelected]}>
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
