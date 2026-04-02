// app/(admin)/study-materials/detail.tsx
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { db } from '@/scripts/firebase';
import type { CEFR, StudyMaterial, StudyMaterialType } from '@/types/admin/studyMaterial';
import { doc, getDoc, Timestamp } from 'firebase/firestore';

type DocData = StudyMaterial & {
  content?: string | null;
  url?: string | null;
  level?: CEFR | 'ALL';
  type?: StudyMaterialType;
  originalFileName?: string | null;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
};

// Rút gọn tên file
function getPrettyFileName(url?: string | null, fallback = 'File tài liệu') {
  if (!url) return fallback;

  try {
    const cleanURL = url.split('?')[0];
    const decoded = decodeURIComponent(cleanURL);
    const lastSegment = decoded.substring(decoded.lastIndexOf('/') + 1);

    const fileName = lastSegment.includes('/')
      ? lastSegment.split('/').pop() ?? fallback
      : lastSegment;

    if (!fileName) return fallback;

    if (fileName.length > 32) {
      const parts = fileName.split('.');
      const ext = parts.length > 1 ? '.' + parts.pop() : '';
      const base = parts.join('.');
      return base.substring(0, 22) + '...' + ext;
    }

    return fileName;
  } catch {
    return fallback;
  }
}

export default function StudyMaterialDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [item, setItem] = useState<DocData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      Alert.alert('Lỗi', 'Thiếu ID tài liệu.');
      router.back();
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const ref = doc(db, 'studyMaterials', id);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          Alert.alert('Thông báo', 'Tài liệu không tồn tại.');
          router.back();
          return;
        }

        setItem(snap.data() as DocData);
      } catch (err) {
        console.error('detail error', err);
        Alert.alert('Lỗi', 'Không tải được chi tiết tài liệu.');
        router.back();
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const formatTime = (ts?: Timestamp | null) => {
    if (!ts) return '';
    const d = ts.toDate();
    return `${d.getDate().toString().padStart(2, '0')}/${
      (d.getMonth() + 1).toString().padStart(2, '0')
    }/${d.getFullYear()} • ${d.getHours().toString().padStart(2, '0')}:${d
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  };

  const handleEdit = () => id && router.push({ pathname: '/(admin)/study-materials/edit', params: { id } });

  const handleOpenFile = async () => {
    if (!item?.url) {
      Alert.alert('Không có file', 'Tài liệu này chưa có đường dẫn file.');
      return;
    }

    try {
      const supported = await Linking.canOpenURL(item.url);
      if (!supported) {
        Alert.alert('Không mở được', 'Thiết bị không hỗ trợ mở đường dẫn này.');
        return;
      }
      await Linking.openURL(item.url);
    } catch (err) {
      console.error('open url error', err);
      Alert.alert('Lỗi', 'Không thể mở tài liệu.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#CBD5E1" />
          <Text style={styles.helperText}>Đang tải chi tiết tài liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerBox}>
          <Ionicons name="alert-circle-outline" size={30} color="#F87171" />
          <Text style={[styles.helperText, { marginTop: 8 }]}>
            Không tìm thấy dữ liệu tài liệu.
          </Text>
          <TouchableOpacity style={styles.backOutlineBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={18} color="#E2E8F0" />
            <Text style={styles.backOutlineText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const tags = Array.isArray(item.tags) ? item.tags : [];
  const level = item.level || 'A1';
  const type = item.type || 'pdf';

  const fileName =
    item.originalFileName || getPrettyFileName(item.url, 'File tài liệu');

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        
        {/* HEADER */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color="#E2E8F0" />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Chi tiết tài liệu</Text>
            <Text style={styles.headerSub}>Xem file gốc & nội dung mô tả</Text>
          </View>

          <TouchableOpacity style={styles.editBtn} onPress={handleEdit}>
            <Ionicons name="create-outline" size={18} color="#F8FAFC" />
            <Text style={styles.editBtnText}>Sửa</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 28 }}
        >
          {/* INFO CARD */}
          <View style={styles.infoCard}>
            <View style={styles.iconBox}>
              <MaterialCommunityIcons
                name={type === 'word' ? 'file-word-box' : 'file-pdf-box'}
                size={34}
                color={type === 'word' ? '#3B82F6' : '#EF4444'}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.titleText}>{item.title}</Text>

              {!!item.description && (
                <Text style={styles.subtitleText}>{item.description}</Text>
              )}

              <View style={styles.metaRow}>
                <View style={styles.levelPill}>
                  <Text style={styles.levelPillText}>CEFR {level}</Text>
                </View>
                <View style={styles.typePill}>
                  <Text style={styles.typePillText}>
                    {type === 'pdf' ? 'PDF' : 'Word'}
                  </Text>
                </View>
              </View>

              {(item.createdAt || item.updatedAt) && (
                <Text style={styles.timeText}>
                  {item.updatedAt
                    ? `Cập nhật: ${formatTime(item.updatedAt)}`
                    : `Tạo: ${formatTime(item.createdAt)}`}
                </Text>
              )}
            </View>
          </View>

          {/* TAGS */}
          {tags.length > 0 && (
            <View style={{ marginTop: 18 }}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagRow}>
                {tags.map((t, i) => (
                  <View key={i} style={styles.tagChip}>
                    <Text style={styles.tagText}>#{t}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* FILE BLOCK */}
          <View style={{ marginTop: 22 }}>
            <Text style={styles.sectionTitle}>File tài liệu</Text>

            <View style={styles.fileCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.fileIconBox}>
                  <MaterialCommunityIcons
                    name={type === 'word' ? 'microsoft-word' : 'file-pdf-box'}
                    size={30}
                    color={type === 'word' ? '#2563EB' : '#DC2626'}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={styles.fileNameText}>
                    {fileName}
                  </Text>
                  <Text style={styles.fileTypeText}>
                    {type === 'pdf' ? 'PDF Document' : 'Word Document'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.openBtn, !item.url && { opacity: 0.45 }]}
                disabled={!item.url}
                onPress={handleOpenFile}
              >
                <Ionicons name="open-outline" size={18} color="#0F172A" />
                <Text style={styles.openBtnText}>Mở tài liệu</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* CONTENT */}
          <View style={{ marginTop: 22 }}>
            <Text style={styles.sectionTitle}>Nội dung / ghi chú</Text>
            <View style={styles.contentBox}>
              <Text style={styles.contentText}>
                {item.content?.trim()
                  ? item.content
                  : '— Chưa nhập nội dung cho tài liệu này —'}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/* ==================== STYLES ==================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },

  /* Center */
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  helperText: {
    marginTop: 8,
    color: '#94A3B8',
    fontSize: 14,
  },

  /* Header */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(148,163,184,0.25)',
    marginRight: 12,
  },
  headerTitle: {
    color: '#F1F5F9',
    fontSize: 20,
    fontWeight: '700',
  },
  headerSub: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 2,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(203,213,225,0.5)',
    borderRadius: 999,
  },
  editBtnText: {
    color: '#F8FAFC',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '600',
  },

  /* Back btn (error view) */
  backOutlineBtn: {
    marginTop: 16,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  backOutlineText: {
    color: '#E2E8F0',
    marginLeft: 6,
  },

  /* Info card */
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    marginTop: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(30,41,59,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
    marginRight: 12,
  },
  titleText: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  subtitleText: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 3,
  },

  metaRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
    flexWrap: 'wrap',
  },
  levelPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.6)',
    backgroundColor: 'rgba(56,189,248,0.12)',
  },
  levelPillText: {
    color: '#67E8F9',
    fontSize: 11,
    fontWeight: '600',
  },
  typePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(129,140,248,0.6)',
    backgroundColor: 'rgba(129,140,248,0.12)',
  },
  typePillText: {
    color: '#A5B4FC',
    fontSize: 11,
    fontWeight: '600',
  },
  timeText: {
    marginTop: 8,
    color: '#64748B',
    fontSize: 11,
  },

  /* Tags */
  sectionTitle: {
    color: '#E2E8F0',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(99,102,241,0.15)',
  },
  tagText: {
    color: '#A5B4FC',
    fontSize: 12,
  },

  /* File */
  fileCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(51,65,85,0.85)',
    backgroundColor: 'rgba(30,41,59,0.9)',
  },
  fileIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.4)',
  },
  fileNameText: {
    color: '#F1F5F9',
    fontSize: 14,
    fontWeight: '600',
  },
  fileTypeText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 3,
  },
  openBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FACC15',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  openBtnText: {
    marginLeft: 6,
    fontWeight: '700',
    color: '#0F172A',
    fontSize: 13,
  },

  /* Content */
  contentBox: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(51,65,85,0.85)',
    backgroundColor: 'rgba(30,41,59,0.9)',
  },
  contentText: {
    color: '#F1F5F9',
    fontSize: 14,
    lineHeight: 20,
  },
});
