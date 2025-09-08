// app/(admin)/listen/index.tsx

import { db } from '@/scripts/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ⬇️ THÊM DÒNG NÀY (đúng path thư mục style của bạn)
import { COLORS, ListenStyles } from '@/components/style/ListenStyles';

type Listen = {
  id: string;
  title: string;
  audioUrl?: string;
  transcript?: string;
  createdAt?: Date | null;
};

export default function ListenScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Listen[]>([]);
  const [refreshing, setRefreshing] = useState(false);

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

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const onDelete = (id: string) => {
    Alert.alert('Xoá bài nghe', 'Bạn có chắc muốn xoá?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá',
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

  return (
    <View style={[ListenStyles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <View style={ListenStyles.header}>
        <Text style={ListenStyles.headerTitle}>Quản lý Listen</Text>

        <View style={ListenStyles.headerActions}>
          {/* Seed từ assets lên Firebase */}
          <TouchableOpacity
            onPress={() => router.push('/(admin)/listen/seed')}
            style={ListenStyles.seedIconWrap}
          >
            <Ionicons name="cloud-upload-outline" size={24} color={COLORS.seed} />
          </TouchableOpacity>

          {/* Tạo mới */}
         <TouchableOpacity onPress={() => router.push('/listencreate')}>
  <Ionicons name="add-circle" size={28} color="#4ade80" />
</TouchableOpacity>

        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={ListenStyles.loading} color="#fff" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={ListenStyles.emptyWrap}>
              <Text style={ListenStyles.emptyText}>
                Chưa có bài nghe nào. Hãy bấm biểu tượng{' '}
                <Text style={ListenStyles.emptyTextEm}>Seed</Text> để đẩy mp3 từ assets lên hoặc
                bấm <Text style={ListenStyles.emptyTextPlus}>+</Text> để tạo mới.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={ListenStyles.item}>
              <Text style={ListenStyles.itemTitle}>{item.title}</Text>

              {item.createdAt && (
                <Text style={ListenStyles.itemDate}>
                  {item.createdAt.toLocaleDateString()}
                </Text>
              )}

              {!!item.audioUrl && (
                <Text style={ListenStyles.itemMeta} numberOfLines={1}>
                  🔊 {item.audioUrl}
                </Text>
              )}
              {!!item.transcript && (
                <Text style={ListenStyles.itemMeta2} numberOfLines={2}>
                  📝 {item.transcript}
                </Text>
              )}

              <View style={ListenStyles.itemActions}>
                <TouchableOpacity
                  onPress={() => router.push(`/(admin)/listen/${item.id}`)}
                  style={ListenStyles.itemEditBtn}
                >
                  <Ionicons name="create-outline" size={22} color={COLORS.edit} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDelete(item.id)}>
                  <Ionicons name="trash-outline" size={22} color={COLORS.del} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
