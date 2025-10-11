import { GAME_ITEMS } from '@/constants/tab/playgame';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function GameHub() {
  const router = useRouter();
  const items = useMemo(() => GAME_ITEMS.filter((x) => x.id !== 'game-hub'), []);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={s.card} onPress={() => router.push(item.route)}>
      <LinearGradient colors={item.gradient} style={StyleSheet.absoluteFill} />
      <View style={s.row}>
        <Ionicons name={item.icon as any} size={22} color="#fff" />
        <Text style={s.title}>{item.title}</Text>
      </View>
      <Text style={s.sub}>{item.subtitle}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={s.container}>
      {/* 🔙 Header có nút Trở về */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.push('/(tabs)/playgame')}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={s.backText}>Trở về</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Game Hub</Text>
      </View>

      {/* Danh sách game */}
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f6f6ff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: '#676769ff',
    justifyContent: 'space-between',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#f9fafb',
    fontSize: 16,
    fontWeight: '700',
    
  },
  card: {
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
    backgroundColor: '#1f2937',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  sub: {
    color: '#d1d5db',
    marginTop: 6,
  },
});
