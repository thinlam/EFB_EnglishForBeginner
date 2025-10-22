import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { vocabIndexStyles as S } from '@/components/style/Game/vocab-index';

type Mode = {
  key: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: [string, string];
  route: string;
  disabled?: boolean;
  badge?: string;
};

const MODES: Mode[] = [
  {
    key: 'sprint',
    title: 'Vocab Sprint',
    subtitle: 'Đúng/Sai thật nhanh trong 60s',
    icon: 'flash',
    gradient: ['#6366f1', '#22c55e'],
    route: '/game/vocab/VocabSprint',
    badge: 'Hot',
  },
  {
    key: 'puzzle',
    title: 'Word Puzzle',
    subtitle: 'Ghép nghĩa — Coming soon',
    icon: 'extension-puzzle-outline' as any,
    gradient: ['#0ea5e9', '#6366f1'],
    route: '/game/vocab/word-puzzle',
    disabled: true,
    badge: 'Soon',
  },
  {
    key: 'listen',
    title: 'Listen & Tap',
    subtitle: 'Nghe & chọn từ — Coming soon',
    icon: 'headset',
    gradient: ['#a78bfa', '#f472b6'],
    route: '/game/vocab/listen-tap',
    disabled: true,
    badge: 'Soon',
  },
];

export default function VocabIndexScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={S.container} edges={['top']}>
      {/* --- HEADER --- */}
      <View style={S.header}>
        <TouchableOpacity style={S.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={S.title}>Vocabulary</Text>
          <Text style={S.subtitle}>Chọn chế độ để bắt đầu luyện</Text>
        </View>
        <View style={{ width: 40 }} /> 
      </View>

      {/* --- BODY --- */}
      <ScrollView contentContainerStyle={S.list} showsVerticalScrollIndicator={false}>
        {MODES.map((m) => (
          <TouchableOpacity
            key={m.key}
            activeOpacity={0.9}
            onPress={() => !m.disabled && router.push(m.route as any)}
            disabled={!!m.disabled}
            style={[S.card, m.disabled && S.cardDisabled]}
          >
            <LinearGradient
              colors={m.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={S.cardBg}
            />
            <View style={S.cardContent}>
              <View style={S.iconWrap}>
                <Ionicons name={m.icon as any} size={22} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={S.cardTitle}>{m.title}</Text>
                <Text style={S.cardSubtitle}>{m.subtitle}</Text>
              </View>
              <View style={S.rightWrap}>
                {m.badge && (
                  <View style={S.badge}>
                    <Text style={S.badgeText}>{m.badge}</Text>
                  </View>
                )}
                <View style={S.playBtn}>
                  <Ionicons
                    name={m.disabled ? 'lock-closed' : 'play'}
                    size={18}
                    color="#0f172a"
                  />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
