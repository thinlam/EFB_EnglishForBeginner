import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { db } from '@/scripts/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function EditPremiumPlan() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>(null);

  const load = async () => {
    const snap = await getDoc(doc(db, 'premium_plans', id as string));
    if (snap.exists()) setForm(snap.data());
    setLoading(false);
  };

  const save = async () => {
    await updateDoc(doc(db, 'premium_plans', id as string), {
      ...form,
      price: Number(form.price),
      sale: Number(form.sale),
      duration: form.duration ? Number(form.duration) : null,
    });

    Alert.alert('Thành công', 'Đã cập nhật gói Premium.');
    router.back();
  };

  useEffect(() => {
    load();
  }, []);

  if (loading || !form) return <Text style={{ marginTop: 30, textAlign: 'center' }}>Đang tải...</Text>;

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 12,
        backgroundColor: '#F5F7FA',
      }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
      >
        {/* HEADER */}
        <Text
          style={{
            fontSize: 28,
            fontWeight: '800',
            color: '#111827',
            marginBottom: 26,
          }}
        >
          Sửa gói Premium
        </Text>

        {/* FORM INPUTS */}
        <Input
          label="Tên gói *"
          value={form.label}
          onChangeText={(v: any) => setForm({ ...form, label: v })}
        />

        <Input
          label="Mô tả"
          value={form.description}
          onChangeText={(v: any) => setForm({ ...form, description: v })}
          multiline
          height={90}
        />

        <Input
          label="Giá *"
          keyboardType="numeric"
          value={String(form.price)}
          onChangeText={(v: any) => setForm({ ...form, price: v })}
        />

        <Input
          label="Đơn vị tiền"
          value={form.currency}
          onChangeText={(v: any) => setForm({ ...form, currency: v })}
        />

        <Input
          label="Giảm giá (%)"
          keyboardType="numeric"
          value={String(form.sale ?? 0)}
          onChangeText={(v: any) => setForm({ ...form, sale: v })}
        />

        <Input
          label="Thời hạn (ngày) — để trống = Lifetime"
          keyboardType="numeric"
          value={form.duration ? String(form.duration) : ''}
          onChangeText={(v: any) => setForm({ ...form, duration: v })}
        />

        {/* SAVE BUTTON */}
        <TouchableOpacity
          onPress={save}
          style={{
            marginTop: 20,
            backgroundColor: '#4F46E5',
            paddingVertical: 16,
            borderRadius: 14,
            alignItems: 'center',

            shadowColor: '#4F46E5',
            shadowOpacity: 0.25,
            shadowRadius: 10,
          }}
        >
          <Text
            style={{
              color: '#FFF',
              fontWeight: '700',
              fontSize: 17,
              letterSpacing: 0.3,
            }}
          >
            Lưu thay đổi
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

/* Reusable Premium Input Component */
function Input({
  label,
  value,
  onChangeText,
  keyboardType,
  multiline,
  height,
}: any) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text
        style={{
          fontSize: 15,
          fontWeight: '600',
          marginBottom: 8,
          color: '#374151',
        }}
      >
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        style={{
          backgroundColor: '#F0F2F5',
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderRadius: 14,
          fontSize: 15,
          minHeight: height ?? 48,

          borderWidth: 1,
          borderColor: '#E5E7EB',

          color: '#111827',

          shadowColor: '#000',
          shadowOpacity: 0.02,
          shadowRadius: 4,
        }}
      />
    </View>
  );
}
