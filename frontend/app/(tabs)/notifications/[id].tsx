import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/** Firebase */
// eslint-disable-next-line import/no-unresolved
import { db } from '@/scripts/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

/** Styles */
// eslint-disable-next-line import/no-unresolved
import { notificationDetailStyles as S } from '@/components/style/tab/NotificationDetailStyles';

export default function NotificationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const load = async () => {
    try {
      const ref = doc(db, 'notifications', id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const d = { id: snap.id, ...snap.data() };
        setData(d);

        // 🔥 mark as read (nếu chưa)
        if (!d?.read) {
          await updateDoc(ref, { read: true });
        }
      }
    } catch (err) {
      console.log('Load notification detail error:', err);
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

  if (!data)
    return (
      <View style={S.loadingWrap}>
        <Text style={{ fontSize: 16 }}>Không tìm thấy thông báo</Text>
      </View>
    );

  return (
    <SafeAreaView style={S.container}>
      {/* Header */}
      <View style={S.header}>
        <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#0f172a" />
        </TouchableOpacity>
        <Text style={S.headerText}>Notification</Text>
      </View>

      {/* Content */}
      <ScrollView showsVerticalScrollIndicator={false} style={S.body}>
        <View style={S.iconWrap}>
          <Ionicons name={data.icon || 'notifications'} size={36} color="#3b82f6" />
        </View>

        <Text style={S.title}>{data.title}</Text>

        <Text style={S.time}>
          {new Date(data.createdAt?.toDate?.()).toLocaleString()}
        </Text>

        <Text style={S.message}>{data.message}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
