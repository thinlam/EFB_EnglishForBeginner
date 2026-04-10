import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/** Firebase */
// eslint-disable-next-line import/no-unresolved
import { auth, db } from '@/scripts/firebase';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';

/** Styles */
// eslint-disable-next-line import/no-unresolved
import { notificationStyles as S } from '@/components/style/tab/NotificationStyles';

export default function NotificationScreen() {
  const router = useRouter(); // 🔥 Thêm router vào đây

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);

  const load = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const q = query(
        collection(db, 'notifications'),
        where('uid', '==', uid),
        orderBy('createdAt', 'desc')
      );

      const snap = await getDocs(q);
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setItems(arr);
    } catch (err) {
      console.log('Load notifications error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading)
    return (
      <View style={S.loadingWrap}>
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <SafeAreaView style={S.container}>
      <Text style={S.header}>Notifications</Text>

      {items.length === 0 ? (
        <View style={S.emptyWrap}>
          <Ionicons name="notifications-off-outline" size={48} color="#94a3b8" />
          <Text style={S.emptyText}>Không có thông báo mới</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={S.itemCard}
              onPress={() => router.push(`/notifications/${item.id}`)}
 // 🔥 Điều hướng
            >
              <View style={S.iconWrap}>
                <Ionicons name={item.icon || 'notifications'} size={26} color="#3b82f6" />
              </View>

              <View style={S.itemContent}>
                <Text style={S.itemTitle}>{item.title}</Text>
                <Text style={S.itemMsg}>{item.message}</Text>

                <Text style={S.itemTime}>
                  {new Date(item.createdAt?.toDate?.()).toLocaleString()}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}
