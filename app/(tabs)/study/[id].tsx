// app/(tabs)/study/[id].tsx
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { db } from '@/scripts/firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';

import type { CEFR, StudyMaterial, StudyMaterialType } from '@/types/admin/studyMaterial';

/* ========================
   TYPES
======================== */
type DocData = StudyMaterial & {
  content?: string | null;
  url?: string | null;
  level?: CEFR | 'ALL';
  type?: StudyMaterialType | null;
  createdAt?: Timestamp | null;
};

/* ========================
   SCREEN
======================== */
export default function StudyDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [data, setData] = useState<DocData | null>(null);
  const [loading, setLoading] = useState(true);

  /* --- Load Firestore --- */
  useEffect(() => {
    (async () => {
      try {
        const ref = doc(db, 'studyMaterials', id as string);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          Alert.alert('Không tìm thấy tài liệu');
          router.back();
          return;
        }

        setData(snap.data() as DocData);
      } catch (e: any) {
        Alert.alert('Lỗi tải dữ liệu', e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Không có dữ liệu.</Text>
      </View>
    );
  }

  const openFile = () => {
    if (!data.url) {
      Alert.alert('Không có file đính kèm');
      return;
    }
    Linking.openURL(data.url);
  };

  /* ================================
      BADGE COMPONENT
  ================================== */
  const Badge = ({ label, icon }: any) => (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#EEF2FF',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginRight: 10,
      }}
    >
      <Ionicons name={icon} size={16} color="#4F46E5" />
      <Text style={{ marginLeft: 6, color: '#4F46E5', fontWeight: '600', fontSize: 14 }}>
        {label}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        contentContainerStyle={{
          padding: 18,
          paddingBottom: 100,
        }}
      >
        {/* Header */}
        <TouchableOpacity
          onPress={() => router.push('/WordBook')}

          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
        >
          <Ionicons name="chevron-back" size={26} color="#111" />
          <Text style={{ fontSize: 18, fontWeight: '500', marginLeft: 4 }}>Quay lại</Text>
        </TouchableOpacity>

        {/* Icon chủ đề */}
        <View
          style={{
            alignSelf: 'center',
            backgroundColor: '#EEF2FF',
            padding: 20,
            borderRadius: 50,
            marginBottom: 20,
          }}
        >
          <MaterialCommunityIcons
            name="book-open-page-variant-outline"
            size={48}
            color="#4F46E5"
          />
        </View>

        {/* Title */}
        <Text style={{ fontSize: 26, fontWeight: '800', marginBottom: 10, textAlign: 'center' }}>
          {data.title}
        </Text>

        {/* Badges */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 18 }}>
          <Badge label={data.level} icon="bar-chart" />
          <Badge label={data.type?.toUpperCase()} icon="document-text-outline" />
        </View>

        {/* Description */}
        {data.description ? (
          <View
            style={{
              backgroundColor: '#F9FAFB',
              padding: 16,
              borderRadius: 12,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: '#E5E7EB',
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 6 }}>
              Mô tả tài liệu
            </Text>
            <Text style={{ fontSize: 15, lineHeight: 22, color: '#333' }}>
              {data.description}
            </Text>
          </View>
        ) : null}

        {/* Content (text mode) */}
        {data.type === 'text' && data.content ? (
          <View
            style={{
              backgroundColor: '#F3F4F6',
              padding: 18,
              borderRadius: 12,
              borderColor: '#E5E7EB',
              borderWidth: 1,
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: '600', marginBottom: 10 }}>Nội dung</Text>
            <Text style={{ fontSize: 15, lineHeight: 23, color: '#222' }}>{data.content}</Text>
          </View>
        ) : null}

        {/* File Button */}
        {data.url ? (
          <TouchableOpacity
            onPress={openFile}
            style={{
              backgroundColor: '#4F46E5',
              padding: 16,
              borderRadius: 12,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 30,
            }}
          >
            <Ionicons name="cloud-download-outline" size={24} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 18, marginLeft: 10, fontWeight: '600' }}>
              Mở tài liệu PDF
            </Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
