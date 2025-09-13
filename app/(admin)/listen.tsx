// app/(admin)/listen/index.tsx
import { COLORS, ListenStyles } from '@/components/style/ListenStyles';
import { db } from '@/scripts/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';

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
    Linking,
    RefreshControl,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Listen = {
  id: string;
  title: string;
  audioUrl?: string;
  transcript?: string;
  mediaType?: string | null;
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
          mediaType: raw.mediaType ?? null,
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
          <TouchableOpacity onPress={() => router.push('/ListenCreate')}>
            <Ionicons name="add-circle" size={28} color={COLORS.create} />
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
                Chưa có bài nghe nào. Bấm <Text style={ListenStyles.emptyTextPlus}>+</Text> để tạo
                mới.
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
                <TouchableOpacity
                  onPress={async () => {
                    try {
                      const raw = item.audioUrl!.trim();
                      const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
                      const can = await Linking.canOpenURL(url);
                      if (can) await Linking.openURL(url);
                      else Alert.alert('Không mở được link', url);
                    } catch (e: any) {
                      Alert.alert('Lỗi', e?.message ?? 'Không mở được link');
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      ListenStyles.itemMeta,
                      { color: '#60a5fa', textDecorationLine: 'underline' },
                    ]}
                    numberOfLines={1}
                  >
                    {item.mediaType?.startsWith('video') ? '🎞️' : '🔊'} {item.audioUrl}
                  </Text>
                </TouchableOpacity>
              )}

              {!!item.transcript && (
                <Text style={ListenStyles.itemMeta2} numberOfLines={2}>
                  📝 {item.transcript}
                </Text>
              )}

              <View style={ListenStyles.itemActions}>
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
