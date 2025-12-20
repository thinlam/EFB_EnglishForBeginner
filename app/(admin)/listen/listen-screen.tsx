
import { ListenScreenStyles as S } from "@/components/style/admin/listen";
import { COLORS } from "@/components/style/colors/AppColors";
import { db } from "@/scripts/firebase";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";

import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
type CEFR = "A1" | "A2" | "B1" | "B2" | "C1";
type Topic =
  | "Daily Life"
  | "School"
  | "Career"
  | "Travel"
  | "Family"
  | "Hobbies"
  | "Technology"
  | "Health"
  | "Shopping"
  | "Social";
type Listen = {
  id: string;
  title: string;
  audioUrl?: string;
  transcript?: string;
  mediaType?: string | null;
  level?: CEFR;
  topic?: Topic;
  exerciseFileUrl?: string | null;
  exerciseFileName?: string | null;
  isPublished?: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

const LEVELS: ("ALL" | CEFR)[] = ["ALL", "A1", "A2", "B1", "B2", "C1"];

const TOPICS: ("ALL" | Topic)[] = [
  "ALL",
  "Daily Life",
  "School",
  "Career",
  "Travel",
  "Family",
  "Hobbies",
  "Technology",
  "Health",
  "Shopping",
  "Social",
];

// =========================
// UTILS
// =========================
function formatDate(d?: Date | null) {
  if (!d) return "";
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${d.getFullYear()}`;
}

function colorForLevel(level?: string) {
  switch (level) {
    case "A1":
      return "#22c55e";
    case "A2":
      return "#10b981";
    case "B1":
      return "#06b6d4";
    case "B2":
      return "#60a5fa";
    case "C1":
      return "#a78bfa";
    default:
      return "#9ca3af";
  }
}
function transcriptSnippet(s?: string, max = 48) {
  if (!s) return "";
  const t = s.replace(/\s+/g, " ").trim();
  return t.length > max ? t.slice(0, max) + "…" : t;
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
  const [searchText, setSearchText] = useState("");
  const [filterLevel, setFilterLevel] = useState<"ALL" | CEFR>("ALL");
  const [filterTopic, setFilterTopic] = useState<"ALL" | Topic>("ALL");
  const [modalLevel, setModalLevel] = useState(false);
  const [modalTopic, setModalTopic] = useState(false);
  const [transcriptModal, setTranscriptModal] = useState({
    visible: false,
    id: "",
    title: "",
    content: "",
    editing: false,
  });

  // =========================
  // LOAD DATA
  // =========================
  useFocusEffect(
    useCallback(() => {
      setLoading(true);

      const col = collection(db, "listens");
      const qy = query(col, orderBy("createdAt", "desc"));

      const unsub = onSnapshot(qy, (snap) => {
        const list: Listen[] = [];

        snap.forEach((d) => {
          const raw = d.data() as any;

          list.push({
            id: d.id,
            title: raw.title,
            audioUrl: raw.audioUrl,
            transcript: raw.transcript,
            mediaType: raw.mediaType,
            level: raw.level ?? "A1",
            topic: raw.topic ?? "Daily Life",
            exerciseFileUrl: raw.exerciseFileUrl ?? null,
            exerciseFileName: raw.exerciseFileName ?? null,
            isPublished: !!raw.isPublished,
            createdAt:
              raw.createdAt instanceof Timestamp
                ? raw.createdAt.toDate()
                : null,
            updatedAt:
              raw.updatedAt instanceof Timestamp
                ? raw.updatedAt.toDate()
                : null,
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
    setTimeout(() => setRefreshing(false), 350);
  };

  // =========================
  // FILTER ITEMS
  // =========================
  const filteredItems = useMemo(() => {
    const t = searchText.trim().toLowerCase();

    return items.filter((item) => {
      const matchText =
        item.title.toLowerCase().includes(t) ||
        (item.transcript ?? "").toLowerCase().includes(t);

      const matchLevel =
        filterLevel === "ALL" || item.level === filterLevel;

      const matchTopic =
        filterTopic === "ALL" || item.topic === filterTopic;

      return matchText && matchLevel && matchTopic;
    });
  }, [items, searchText, filterLevel, filterTopic]);

  // =========================
  // ACTIONS
  // =========================
  const editListen = (id: string) =>
    router.push({
      pathname: "/(admin)/listen/listen-create",
      params: { id },
    });

  const gotoQuestions = (id: string) =>
    router.push({
      pathname: "/(admin)/listen/listen-questions/[id]",
      params: { id },
    });

  const deleteListen = (id: string) =>
    Alert.alert("Xoá bài nghe?", "Hành động không thể hoàn tác.", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "listens", id));
          } catch (e: any) {
            Alert.alert("Lỗi", e?.message);
          }
        },
      },
    ]);

  const togglePublish = async (id: string, next: boolean) => {
    try {
      await updateDoc(doc(db, "listens", id), {
        isPublished: next,
        updatedAt: serverTimestamp(),
      });
    } catch (e: any) {
      Alert.alert("Lỗi", e?.message);
    }
  };

  const changeLevel = async (id: string, next: CEFR) => {
    try {
      await updateDoc(doc(db, "listens", id), {
        level: next,
        updatedAt: serverTimestamp(),
      });
    } catch (e: any) {
      Alert.alert("Lỗi", e?.message);
    }
  };

  // =========================
  // TRANSCRIPT MODAL ACTIONS
  // =========================
  const openTranscript = (item: Listen) => {
    if (!item.transcript?.trim()) {
      Alert.alert("Bài này chưa có transcript.");
      return;
    }

    setTranscriptModal({
      visible: true,
      id: item.id,
      title: item.title,
      content: item.transcript,
      editing: false,
    });
  };

  const saveTranscript = async () => {
    try {
      await updateDoc(doc(db, "listens", transcriptModal.id), {
        transcript: transcriptModal.content.trim(),
        updatedAt: serverTimestamp(),
      });

      setTranscriptModal((p) => ({ ...p, editing: false }));
    } catch (e: any) {
      Alert.alert("Lỗi", e?.message);
    }
  };

  // =========================
  // RENDER ITEM
  // =========================
  const renderItem = ({ item }: { item: Listen }) => {
    return (
      <View style={S.card}>
        {/* HEADER */}
        <View style={S.cardHeader}>
          <View style={{ flex: 1 }}>
            {/* TITLE */}
            <View style={S.rowLine}>
              <Ionicons
                name="musical-notes-outline"
                size={16}
                color={COLORS.subText}
              />
              <Text style={S.rowLabel}>Bài nghe:</Text>
              <Text style={S.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>
            </View>

            {/* TOPIC */}
            <View style={[S.rowLine, { marginTop: 4 }]}>
              <Ionicons
                name="albums-outline"
                size={16}
                color={COLORS.subText}
              />
              <Text style={S.rowLabel}>Chủ đề:</Text>
              <Text style={S.rowText}>{item.topic}</Text>
            </View>

            {/* DATE INFO */}
            {(item.createdAt || item.updatedAt) && (
              <View style={[S.rowLine, { marginTop: 4 }]}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={COLORS.subText}
                />
                <Text style={S.rowLabel}>Ngày:</Text>

                {!!item.createdAt && (
                  <Text style={S.rowText}>
                    Tạo {formatDate(item.createdAt)}
                  </Text>
                )}

                {!!item.updatedAt && (
                  <Text style={[S.rowText, { marginLeft: 8 }]}>
                    • Sửa {formatDate(item.updatedAt)}
                  </Text>
                )}
              </View>
            )}

            {/* FILE */}
            {!!item.exerciseFileUrl && (
              <View style={[S.rowLine, { marginTop: 4 }]}>
                <Ionicons
                  name="document-outline"
                  size={16}
                  color={COLORS.link}
                />
                <Text style={S.rowLabel}>File:</Text>
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() =>
                    WebBrowser.openBrowserAsync(item.exerciseFileUrl!)
                  }
                >
                  <Text style={S.rowTextLink} numberOfLines={1}>
                    {item.exerciseFileName}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* TRANSCRIPT */}
            {!!item.transcript && (
              <View style={[S.rowLine, { marginTop: 4 }]}>
                <Ionicons
                  name="document-text-outline"
                  size={16}
                  color={COLORS.link}
                />
                <Text style={S.rowLabel}>Transcript:</Text>
                <TouchableOpacity
                  onPress={() => openTranscript(item)}
                  style={{ flex: 1 }}
                >
                  <Text style={S.rowTextLink} numberOfLines={1}>
                    {transcriptSnippet(item.transcript)}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* RIGHT SIDE BADGES */}
          <View style={{ alignItems: "flex-end" }}>
            <View
              style={[
                S.badge,
                { backgroundColor: colorForLevel(item.level) },
              ]}
            >
              <Text style={S.badgeText}>{item.level}</Text>
            </View>

            <TouchableOpacity
              onPress={() => togglePublish(item.id, !item.isPublished)}
              style={[
                S.badge,
                {
                  marginTop: 8,
                  backgroundColor: item.isPublished
                    ? COLORS.primary
                    : COLORS.border,
                },
              ]}
            >
              <Text
                style={{
                  color: item.isPublished ? COLORS.bg : COLORS.text,
                  fontWeight: "700",
                }}
              >
                {item.isPublished ? "Published" : "Hidden"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ACTION BUTTONS */}
        <View style={[S.cardActions, { marginTop: 14 }]}>
          <TouchableOpacity
            onPress={() => openTranscript(item)}
            style={S.iconBtn}
          >
            <Ionicons
              name="document-outline"
              size={20}
              color={COLORS.text}
            />
            <Text style={S.iconBtnText}>Tài liệu</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => editListen(item.id)}
            style={S.iconBtn}
          >
            <Ionicons
              name="create-outline"
              size={20}
              color={COLORS.edit}
            />
            <Text style={[S.iconBtnText, S.textEdit]}>Sửa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => gotoQuestions(item.id)}
            style={S.iconBtn}
          >
            <Ionicons
              name="help-circle-outline"
              size={20}
              color={COLORS.text}
            />
            <Text style={S.iconBtnText}>Câu hỏi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => deleteListen(item.id)}
            style={S.iconBtn}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color={COLORS.del}
            />
            <Text style={[S.iconBtnText, S.textDel]}>Xoá</Text>
          </TouchableOpacity>
        </View>

        {/* LEVEL QUICK PICKER */}
        <View style={S.levelRow}>
          {(["A1", "A2", "B1", "B2", "C1"] as CEFR[]).map((lv) => {
            const active = item.level === lv;

            return (
              <TouchableOpacity
                key={lv}
                style={[S.levelChip, active && S.levelChipActive]}
                onPress={() => changeLevel(item.id, lv)}
              >
                <Text
                  style={[
                    S.levelChipText,
                    active && S.levelChipTextActive,
                  ]}
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
  // MAIN RENDER
  // =========================
  return (
    <View style={[S.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={S.header}>
        <TouchableOpacity
          onPress={() => router.push("/(admin)/home")}
          style={S.backBtn}
        >
          <Ionicons
            name="arrow-back-outline"
            size={22}
            color={COLORS.text}
          />
        </TouchableOpacity>

        <Text style={S.headerTitle}>Quản lý Listen</Text>

        <View style={{ width: 32 }} />
      </View>

      {/* === FILTER ROW 1 (SEARCH) === */}
      <View style={S.filterRow}>
        <View style={S.searchBox}>
          <Ionicons
            name="search-outline"
            size={18}
            color={COLORS.muted}
            style={{ marginRight: 6 }}
          />
          <TextInput
            placeholder="Tìm theo tiêu đề, transcript…"
            placeholderTextColor={COLORS.muted}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={Keyboard.dismiss}
            style={S.searchInput}
          />
        </View>
      </View>

      {/* === FILTER ROW 2 (LEVEL + TOPIC) === */}
      <View style={[S.filterRow, { flexDirection: "row", gap: 10 }]}>
        {/* LEVEL PICKER */}
        <TouchableOpacity
          style={S.filterPicker}
          onPress={() => setModalLevel(true)}
        >
          <Text style={S.filterValueText}>
            {filterLevel === "ALL"
              ? "Level: All"
              : `Level: ${filterLevel}`}
          </Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color={COLORS.muted}
          />
        </TouchableOpacity>

        {/* TOPIC PICKER */}
        <TouchableOpacity
          style={S.filterPicker}
          onPress={() => setModalTopic(true)}
        >
          <Text style={S.filterValueText}>
            {filterTopic === "ALL"
              ? "Topic: All"
              : `Topic: ${filterTopic}`}
          </Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color={COLORS.muted}
          />
        </TouchableOpacity>
      </View>

      {/* LIST */}
      {loading ? (
        <ActivityIndicator
          style={{ marginTop: 40 }}
          color={COLORS.create}
        />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          contentContainerStyle={{
            paddingBottom: insets.bottom + 80,
          }}
          ListEmptyComponent={
            <View style={S.emptyWrap}>
              <Text style={S.emptyTitle}>Chưa có bài nghe</Text>
              <Text style={S.emptyText}>
                Bấm <Text style={S.emptyEm}>+</Text> để tạo bài mới.
              </Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={() =>
          router.push("/(admin)/listen/listen-create")
        }
        style={[S.fab, { bottom: 24 + insets.bottom }]}
      >
        <Ionicons name="add-outline" size={28} color={COLORS.bg} />
      </TouchableOpacity>

      {/* TRANSCRIPT MODAL */}
      <Modal
        visible={transcriptModal.visible}
        transparent
        animationType="fade"
      >
        <View style={S.overlayCenter}>
          <View style={S.dialog}>
            <TouchableOpacity
              onPress={() =>
                setTranscriptModal((p) => ({ ...p, visible: false }))
              }
              style={S.closeBtn}
            >
              <Ionicons
                name="close"
                size={20}
                color={COLORS.text}
              />
            </TouchableOpacity>

            <Text style={S.modalTitle}>{transcriptModal.title}</Text>

            <ScrollView style={S.modalBody}>
              {transcriptModal.editing ? (
                <TextInput
                  multiline
                  value={transcriptModal.content}
                  onChangeText={(t) =>
                    setTranscriptModal((p) => ({ ...p, content: t }))
                  }
                  style={S.modalInput}
                />
              ) : (
                <Text style={S.modalText}>
                  {transcriptModal.content}
                </Text>
              )}
            </ScrollView>

            <View style={S.modalActions}>
              {!transcriptModal.editing ? (
                <TouchableOpacity
                  style={[S.iconBtn, S.editBtnBg]}
                  onPress={() =>
                    setTranscriptModal((p) => ({ ...p, editing: true }))
                  }
                >
                  <Ionicons
                    name="create-outline"
                    size={20}
                    color={COLORS.text}
                  />
                  <Text style={S.iconBtnText}>Sửa</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[S.iconBtn, S.saveBtnBg]}
                  onPress={saveTranscript}
                >
                  <Ionicons
                    name="save-outline"
                    size={20}
                    color={COLORS.bg}
                  />
                  <Text style={[S.iconBtnText, S.saveBtnText]}>
                    Lưu
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* LEVEL MODAL */}
      <Modal visible={modalLevel} transparent animationType="fade">
        <View style={S.overlayDim}>
          <View style={S.levelDialog}>
            <View style={S.levelHeader}>
              <Text style={S.levelTitle}>Chọn Level</Text>
              <TouchableOpacity
                onPress={() => setModalLevel(false)}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={COLORS.text}
                />
              </TouchableOpacity>
            </View>

            {LEVELS.map((lv) => {
              const active = filterLevel === lv;

              return (
                <TouchableOpacity
                  key={lv}
                  style={S.levelItemRow}
                  onPress={() => {
                    setFilterLevel(lv);
                    setModalLevel(false);
                  }}
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
        </View>
      </Modal>

      {/* TOPIC MODAL */}
      <Modal visible={modalTopic} transparent animationType="fade">
        <View style={S.overlayDim}>
          <View style={S.levelDialog}>
            <View style={S.levelHeader}>
              <Text style={S.levelTitle}>Chọn Topic</Text>
              <TouchableOpacity
                onPress={() => setModalTopic(false)}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={COLORS.text}
                />
              </TouchableOpacity>
            </View>

            {TOPICS.map((tp) => {
              const selected = filterTopic === tp;

              return (
                <TouchableOpacity
                  key={tp}
                  style={S.levelItemRow}
                  onPress={() => {
                    setFilterTopic(tp);
                    setModalTopic(false);
                  }}
                >
                  <Text
                    style={[
                      S.levelItemText,
                      selected && S.levelItemTextSelected,
                    ]}
                  >
                    {tp}
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
        </View>
      </Modal>
    </View>
  );
}
