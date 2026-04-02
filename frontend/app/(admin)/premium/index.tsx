import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { db } from '@/scripts/firebase';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';

export default function AdminPremiumList() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'premium_plans'));
    setPlans(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  const remove = (id: string) => {
    Alert.alert('Xoá gói Premium?', 'Hành động này không thể hoàn tác.', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, 'premium_plans', id));
          load();
        },
      },
    ]);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#F3F4F6',
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 12,
        paddingHorizontal: 18,
      }}
    >
      {/* HEADER */}
      <Text
        style={{
          fontSize: 28,
          fontWeight: '800',
          marginBottom: 20,
          color: '#111827',
        }}
      >
        Quản lý gói Premium
      </Text>

      {/* ADD BUTTON */}
      <TouchableOpacity
        onPress={() => router.push('/(admin)/premium/create')}
        style={{
          backgroundColor: '#4F46E5',
          paddingVertical: 14,
          borderRadius: 14,
          marginBottom: 24,
          shadowColor: '#4F46E5',
          shadowOpacity: 0.25,
          shadowRadius: 10,
        }}
      >
        <Text
          style={{
            color: '#FFF',
            fontWeight: '700',
            textAlign: 'center',
            fontSize: 16,
            letterSpacing: 0.3,
          }}
        >
          + Thêm gói Premium
        </Text>
      </TouchableOpacity>

      {/* LIST */}
      {loading ? (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>Đang tải…</Text>
      ) : (
        <FlatList
          contentContainerStyle={{ paddingBottom: 80 }}
          data={plans}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const discountedPrice =
              item.sale && item.sale > 0
                ? item.price - (item.price * item.sale) / 100
                : null;

            return (
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: 18,
                  borderRadius: 16,
                  marginBottom: 18,
                  shadowColor: '#000',
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                }}
              >
                {/* LABEL + BADGE */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: '700',
                      color: '#111827',
                    }}
                  >
                    {item.label}
                  </Text>

                  {item.badge ? (
                    <View
                      style={{
                        backgroundColor: '#FBBF24',
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ color: '#78350F', fontWeight: '700' }}>
                        {item.badge}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* PRICE */}
                <View style={{ marginBottom: 8 }}>
                  {discountedPrice ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: '800',
                          color: '#10B981',
                        }}
                      >
                        {discountedPrice.toLocaleString()} {item.currency}
                      </Text>

                      <Text
                        style={{
                          fontSize: 14,
                          marginLeft: 8,
                          textDecorationLine: 'line-through',
                          color: '#6B7280',
                        }}
                      >
                        {item.price.toLocaleString()} {item.currency}
                      </Text>
                    </View>
                  ) : (
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: '800',
                        color: '#111827',
                      }}
                    >
                      {item.price.toLocaleString()} {item.currency}
                    </Text>
                  )}
                </View>

                {/* SALE + DURATION */}
                <Text style={{ color: '#4B5563', marginBottom: 2 }}>
                  Giảm giá: {item.sale ?? 0}%
                </Text>

                <Text style={{ color: '#4B5563', marginBottom: 2 }}>
                  Thời hạn:{' '}
                  {item.duration ? `${item.duration} ngày` : 'Lifetime'}
                </Text>

                <Text
                  style={{
                    marginTop: 2,
                    fontWeight: '600',
                    color: item.isActive ? '#059669' : '#DC2626',
                  }}
                >
                  {item.isActive ? 'Đang kích hoạt' : 'Đang tắt'}
                </Text>

                {/* BUTTONS */}
                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: 18,
                    justifyContent: 'flex-end',
                  }}
                >
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: '/(admin)/premium/edit',
                        params: { id: item.id },
                      })
                    }
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 10,
                      paddingHorizontal: 14,
                      backgroundColor: '#3B82F6',
                      borderRadius: 10,
                      marginRight: 10,
                    }}
                  >
                    <Ionicons name="create-outline" size={18} color="#FFF" />
                    <Text style={{ color: '#FFF', marginLeft: 6 }}>Sửa</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => remove(item.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 10,
                      paddingHorizontal: 14,
                      backgroundColor: '#EF4444',
                      borderRadius: 10,
                    }}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FFF" />
                    <Text style={{ color: '#FFF', marginLeft: 6 }}>Xoá</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}
