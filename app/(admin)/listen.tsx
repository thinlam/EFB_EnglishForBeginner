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
        const raw = d.data();
        return {
          id: d.id,
          title: raw.title ?? '(Không tiêu đề)',
          audioUrl: raw.audioUrl ?? '',
          transcript: raw.transcript ?? '',
          createdAt: raw.createdAt instanceof Timestamp ? raw.createdAt.toDate() : null,
        };
      });
      setItems(data);
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

  const onDelete = async (id: string) => {
    Alert.alert('Xoá bài nghe', 'Bạn có chắc muốn xoá?', [
      { text: 'Huỷ' },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, 'listens', id));
          setItems((prev) => prev.filter((i) => i.id !== id));
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0b1220', paddingTop: insets.top }}>
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255,255,255,0.1)',
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>Quản lý Listen</Text>
        <TouchableOpacity onPress={() => router.push('/(admin)/listen/create')}>
          <Ionicons name="add-circle" size={28} color="#4ade80" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#fff" />
      ) : (
        <FlatList
data={items}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <View
              style={{
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(255,255,255,0.05)',
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
                {item.title}
              </Text>
              {item.createdAt && (
                <Text style={{ fontSize: 12, color: '#aaa' }}>
                  {item.createdAt.toLocaleDateString()}
                </Text>
              )}

              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                <TouchableOpacity
                  onPress={() => router.push(`/(admin)/listen/${item.id}`)}
                  style={{ marginRight: 16 }}
                >
                  <Ionicons name="create-outline" size={22} color="#60a5fa" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDelete(item.id)}>
                  <Ionicons name="trash-outline" size={22} color="#f87171" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}