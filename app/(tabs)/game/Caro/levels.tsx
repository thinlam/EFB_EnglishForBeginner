import { CARO_LEVELS } from '@/constants/game/caro';
import { useUserProgress } from '@/hooks/games/useUserProgress';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CaroLevelMap() {
  const router = useRouter();
  const { unlockedMax, starsByLevel }: { unlockedMax: number; starsByLevel: { [key: number]: number } } = useUserProgress('caro'); // ví dụ: lấy từ Firestore/Async

  interface LevelItem {
    index: number;
    requireText: string;
    goal: string;
  }

  const renderLevel = ({ item }: { item: LevelItem }) => {
    const locked = item.index > unlockedMax;
    const stars = starsByLevel[item.index] ?? 0;

    return (
      <TouchableOpacity
        disabled={locked}
        onPress={() => router.push({ pathname: '/game/Caro/[level]', params: { level: String(item.index) } })}
        style={[s.level, locked && s.locked]}
      >
        <Text style={s.levelTitle}>Level {item.index}</Text>
        {locked ? (
          <View style={s.lockRow}>
            <Ionicons name="lock-closed" size={16} color="#9ca3af" />
            <Text style={s.lockText}>{item.requireText}</Text>
          </View>
        ) : (
          <View style={s.starRow}>
            {[1,2,3].map(i => (
              <Ionicons
                key={i}
                name={i <= stars ? 'star' : 'star-outline'}
                size={18}
                color={i <= stars ? '#FBBF24' : '#9ca3af'}
              />
            ))}
          </View>
        )}
        <Text style={s.desc}>{item.goal}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={CARO_LEVELS}
      keyExtractor={(it) => String(it.index)}
      renderItem={renderLevel}
      numColumns={2}
      columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
      contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingVertical: 16, gap: 12, paddingBottom: 24 }}
    />
  );
}

const s = StyleSheet.create({
  level: { flex: 1, minHeight: 120, borderRadius: 16, backgroundColor: '#111827', padding: 12 },
  locked: { opacity: 0.6 },
  levelTitle: { color: '#fff', fontWeight: '700' },
  starRow: { flexDirection: 'row', gap: 4, marginTop: 6 },
  lockRow: { flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 6 },
  lockText: { color: '#9ca3af' },
  desc: { color: '#d1d5db', marginTop: 8, fontSize: 12 },
});
