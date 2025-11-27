// app/reading/[id].tsx
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { db } from '@/scripts/firebase';
import { Timestamp, doc, onSnapshot } from 'firebase/firestore';

type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
type Topic =
  | 'Work & Office'
  | 'Travel & Transport'
  | 'Daily Life'
  | 'Shopping & Service'
  | 'Education'
  | 'Technology'
  | 'Entertainment'
  | 'Health & Food'
  | 'Business';

type Reading = {
  id: string;
  title: string;
  passage?: string;
  sourceUrl?: string;
  level?: CEFR;
  topic?: Topic;
  bandMin?: number;
  bandMax?: number;
  questionsCount?: number;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

function bandLabel(min?: number, max?: number) {
  if (!min && !max) return '—';
  if (min && max) return `${min}–${max}`;
  if (min && !max) return `${min}+`;
  return `${max}`;
}

function wordsCount(s?: string) {
  if (!s) return 0;
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function normalizeUrl(raw?: string) {
  if (!raw) return '';
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

async function openSourceUrl(url?: string) {
  if (!url) return;
  const safe = normalizeUrl(url);
  try {
    await WebBrowser.openBrowserAsync(safe, {
      enableBarCollapsing: true,
      showTitle: true,
      enableDefaultShareMenuItem: false,
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
    });
  } catch {
    const can = await Linking.canOpenURL(safe);
    if (can) await Linking.openURL(safe);
  }
}

export default function ReadingDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [item, setItem] = useState<Reading | null>(null);
  const [loading, setLoading] = useState(true);

  // ===== LOAD BÀI ĐỌC =====
  useEffect(() => {
    if (!id) return;

    const ref = doc(db, 'readings', id);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setItem(null);
          setLoading(false);
          return;
        }
        const raw = snap.data() as any;
        const data: Reading = {
          id: snap.id,
          title: raw.title ?? '(Không tiêu đề)',
          passage: raw.passage ?? '',
          sourceUrl: raw.sourceUrl ?? '',
          level: raw.level as CEFR,
          topic: raw.topic as Topic,
          bandMin:
            typeof raw.bandMin === 'number' ? raw.bandMin : undefined,
          bandMax:
            typeof raw.bandMax === 'number' ? raw.bandMax : undefined,
          questionsCount:
            typeof raw.questionsCount === 'number'
              ? raw.questionsCount
              : undefined,
          createdAt:
            raw.createdAt instanceof Timestamp
              ? raw.createdAt.toDate()
              : null,
          updatedAt:
            raw.updatedAt instanceof Timestamp
              ? raw.updatedAt.toDate()
              : null,
        };
        setItem(data);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      },
    );

    return () => unsub();
  }, [id]);

  const androidRipple = {
    color: 'rgba(17,24,39,0.08)',
    borderless: false,
  } as const;

  const bg = '#F8FAFC';

  if (!id) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text>ID bài đọc không hợp lệ.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      {/* HEADER */}
      <View
        style={{
          paddingTop: Math.max(insets.top, 8),
          paddingHorizontal: 16,
          paddingBottom: 10,
          backgroundColor: bg,
          borderBottomWidth: Platform.OS === 'ios' ? 0 : 1,
          borderBottomColor: '#E5E7EB',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable
            onPress={() => router.back()}
            android_ripple={androidRipple}
            style={({ pressed }) => [
              {
                width: 36,
                height: 36,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fff',
                shadowColor: '#000',
                shadowOpacity: 0.06,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
                elevation: 1,
                opacity: pressed && Platform.OS === 'ios' ? 0.85 : 1,
              },
            ]}
            accessibilityLabel="Quay lại"
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </Pressable>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text
              numberOfLines={1}
              style={{ color: '#111827', fontSize: 16, fontWeight: '800' }}
            >
              READING
            </Text>
          </View>

          <View style={{ width: 36, height: 36 }} />
        </View>
      </View>

      {/* BODY */}
      {loading ? (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <ActivityIndicator />
        </View>
      ) : !item ? (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: '#6B7280' }}>Không tìm thấy bài đọc.</Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: insets.bottom + 24,
            maxWidth: 720,
            width: '100%',
            alignSelf: 'center',
            gap: 12,
          }}
          contentInsetAdjustmentBehavior="automatic"
          scrollIndicatorInsets={{
            top: 4,
            bottom: insets.bottom + 4,
            left: 0,
            right: 0,
          }}
        >
          {/* Card meta */}
          <View
            style={{
              borderRadius: 16,
              backgroundColor: '#FFFFFF',
              paddingHorizontal: 16,
              paddingVertical: 14,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              shadowColor: '#000',
              shadowOpacity: 0.04,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
              elevation: 1,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '800',
                color: '#111827',
                marginBottom: 6,
              }}
            >
              {item.title}
            </Text>

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8,
                marginTop: 4,
              }}
            >
              {/* Level pill */}
              {item.level && (
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                    backgroundColor: '#EEF2FF',
                    borderWidth: 1,
                    borderColor: '#E0E7FF',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '700',
                      color: '#4F46E5',
                    }}
                  >
                    CEFR {item.level}
                  </Text>
                </View>
              )}

              {/* Topic */}
              {item.topic && (
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                    backgroundColor: '#ECFEFF',
                    borderWidth: 1,
                    borderColor: '#BAE6FD',
                  }}
                >
                  <Text style={{ fontSize: 12, color: '#0369A1' }}>
                    {item.topic}
                  </Text>
                </View>
              )}

              {/* Band */}
              {(item.bandMin || item.bandMax) && (
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                    backgroundColor: '#ECFDF3',
                    borderWidth: 1,
                    borderColor: '#BBF7D0',
                  }}
                >
                  <Text style={{ fontSize: 12, color: '#166534' }}>
                    Band: {bandLabel(item.bandMin, item.bandMax)}
                  </Text>
                </View>
              )}

              {/* Word count */}
              {item.passage && (
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                    backgroundColor: '#FEF3C7',
                    borderWidth: 1,
                    borderColor: '#FDE68A',
                  }}
                >
                  <Text style={{ fontSize: 12, color: '#92400E' }}>
                    {wordsCount(item.passage)} từ
                  </Text>
                </View>
              )}

              {/* Questions count (chỉ để thông tin) */}
              {typeof item.questionsCount === 'number' && (
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                    backgroundColor: '#EEF2FF',
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                  }}
                >
                  <Text style={{ fontSize: 12, color: '#374151' }}>
                    {item.questionsCount} câu hỏi luyện đọc
                  </Text>
                </View>
              )}
            </View>

            {/* Nút nguồn nếu có */}
            {!!item.sourceUrl?.trim() && (
              <TouchableOpacity
                onPress={() => openSourceUrl(item.sourceUrl)}
                activeOpacity={0.8}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 10,
                  gap: 6,
                }}
              >
                <Ionicons name="link-outline" size={16} color="#2563EB" />
                <Text
                  style={{
                    fontSize: 13,
                    color: '#2563EB',
                    textDecorationLine: 'underline',
                  }}
                  numberOfLines={1}
                >
                  {item.sourceUrl}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Card passage */}
          <View
            style={{
              borderRadius: 16,
              backgroundColor: '#FFFFFF',
              paddingHorizontal: 16,
              paddingVertical: 14,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              shadowColor: '#000',
              shadowOpacity: 0.03,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 3 },
              elevation: 1,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 8,
                gap: 6,
              }}
            >
              <Ionicons
                name="document-text-outline"
                size={18}
                color="#4B5563"
              />
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '700',
                  color: '#111827',
                }}
              >
                Passage
              </Text>
            </View>

            {item.passage?.trim() ? (
              <Text
                style={{
                  fontSize: 14,
                  lineHeight: 22,
                  color: '#1F2933',
                }}
              >
                {item.passage}
              </Text>
            ) : (
              <Text style={{ fontSize: 13, color: '#6B7280' }}>
                Bài đọc này chưa có nội dung.
              </Text>
            )}
          </View>

          {/* Nút sang trang làm bài luyện đọc */}
          {item.questionsCount && item.questionsCount > 0 && (
            <TouchableOpacity
              onPress={() =>
                router.push({ pathname: '/reading/questions', params: { id } })
              }
              activeOpacity={0.85}
              style={{
                marginTop: 4,
                backgroundColor: '#4F46E5',
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: 'white',
                  fontSize: 15,
                  fontWeight: '700',
                }}
              >
                Làm bài luyện đọc
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
