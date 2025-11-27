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
  content?: string | null;          // text (nếu có)
  url?: string | null;              // link file Storage
  level?: CEFR | 'ALL';
  type?: StudyMaterialType;
  originalFileName?: string | null; // nếu có lưu
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
};

/** Lấy tên file đẹp, không còn files%2F, encode, query string */
function getPrettyFileName(url?: string | null, fallback = 'File tài liệu') {
  if (!url) return fallback;

  try {
    // bỏ query (?alt=media...)
    const cleanURL = url.split('?')[0];

    // decode trước, rồi lấy đoạn sau dấu /
    const decoded = decodeURIComponent(cleanURL);
    const lastSegment = decoded.substring(decoded.lastIndexOf('/') + 1);

    // nếu vẫn còn path (vd "files/abc.pdf")
    const fileName = lastSegment.includes('/')
      ? lastSegment.split('/').pop() ?? fallback
      : lastSegment;

    if (!fileName) return fallback;

    // rút gọn nếu quá dài
    if (fileName.length > 40) {
      const parts = fileName.split('.');
      const ext = parts.length > 1 ? '.' + parts.pop() : '';
      const base = parts.join('.');
      return base.substring(0, 26) + '...' + ext;
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
  }, [id, router]);

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

  const handleEdit = () => {
    if (!id) return;
    router.push({
      pathname: '/(admin)/study-materials/edit',
      params: { id },
    });
  };

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
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#E5E7EB" />
          <Text style={styles.helperText}>Đang tải chi tiết tài liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.centerBox}>
          <Ionicons name="alert-circle-outline" size={28} color="#F97373" />
          <Text style={[styles.helperText, { color: '#FCA5A5', marginTop: 8 }]}>
            Không tìm thấy dữ liệu tài liệu.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backOutlineBtn}
          >
            <Ionicons name="arrow-back" size={18} color="#E5E7EB" />
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
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color="#E5E7EB" />
          </TouchableOpacity>

          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Chi tiết tài liệu
            </Text>
            <Text style={styles.headerSub} numberOfLines={1}>
              Xem file gốc và nội dung mô tả
            </Text>
          </View>

          <TouchableOpacity style={styles.editBtn} onPress={handleEdit}>
            <Ionicons name="create-outline" size={18} color="#E5E7EB" />
            <Text style={styles.editBtnText}>Sửa</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 24,
          }}
        >
          {/* Info box */}
          <View style={styles.infoCard}>
            <View style={styles.iconBox}>
              <MaterialCommunityIcons
                name={type === 'word' ? 'file-word-box' : 'file-pdf-box'}
                size={32}
                color={type === 'word' ? '#3B82F6' : '#EF4444'}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.titleText}>{item.title}</Text>
              {!!item.description && (
                <Text style={styles.subtitleText} numberOfLines={2}>
                  {item.description}
                </Text>
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
                    : item.createdAt
                    ? `Tạo: ${formatTime(item.createdAt)}`
                    : ''}
                </Text>
              )}
            </View>
          </View>

          {/* Tags */}
          {tags.length > 0 && (
            <View style={{ marginTop: 12, marginBottom: 8 }}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagRow}>
                {tags.map((t, idx) => (
                  <View key={idx} style={styles.tagChip}>
                    <Text style={styles.tagText}>#{t}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* File block */}
          <View style={{ marginTop: 16 }}>
            <Text style={styles.sectionTitle}>File tài liệu</Text>

            <View style={styles.fileCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.fileIconBox}>
                  <MaterialCommunityIcons
                    name={type === 'word' ? 'microsoft-word' : 'file-pdf-box'}
                    size={28}
                    color={type === 'word' ? '#2563EB' : '#DC2626'}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.fileNameText} numberOfLines={1}>
                    {fileName}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                    {type === 'pdf' ? 'PDF Document' : 'Word Document'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.openBtn,
                  !item.url && { opacity: 0.5 },
                ]}
                onPress={handleOpenFile}
                disabled={!item.url}
              >
                <Ionicons name="open-outline" size={18} color="#0F172A" />
                <Text style={styles.openBtnText}>Mở tài liệu</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Content text (optional) */}
          <View style={{ marginTop: 16 }}>
            <Text style={styles.sectionTitle}>Nội dung / ghi chú</Text>
            <View style={styles.contentBox}>
              <Text style={styles.contentText}>
                {item.content?.trim()
                  ? item.content
                  : '— Chưa nhập nội dung text cho tài liệu này —'}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/* ========== Styles ========== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  helperText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: 'rgba(148, 163, 184, 0.25)',
  },
  headerTitleBox: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E5E7EB',
  },
  headerSub: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.7)',
  },
  editBtnText: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },

  backOutlineBtn: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  backOutlineText: {
    color: '#E5E7EB',
    marginLeft: 6,
    fontWeight: '600',
  },

  infoCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(15,23,42,0.9)',
    marginTop: 4,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(15,23,42,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.4)',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  subtitleText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  levelPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(56,189,248,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.7)',
  },
  levelPillText: {
    fontSize: 11,
    color: '#67E8F9',
    fontWeight: '600',
  },
  typePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(129,140,248,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(129,140,248,0.7)',
  },
  typePillText: {
    fontSize: 11,
    color: '#A5B4FC',
    fontWeight: '600',
  },
  timeText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 6,
  },

  sectionTitle: {
    fontSize: 14,
    color: '#E5E7EB',
    fontWeight: '600',
    marginBottom: 6,
  },

  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(79,70,229,0.12)',
  },
  tagText: {
    fontSize: 11,
    color: '#A5B4FC',
  },

  fileCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(51,65,85,0.9)',
    backgroundColor: 'rgba(15,23,42,0.95)',
    padding: 12,
  },
  fileIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(15,23,42,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.5)',
  },
  fileNameText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  openBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FACC15',
  },
  openBtnText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },

  contentBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(51,65,85,0.9)',
    backgroundColor: 'rgba(15,23,42,0.95)',
    padding: 12,
  },
  contentText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#E5E7EB',
  },
});
