import { GAME_ITEMS } from '@/constants/tab/playgame';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function GameHub() {
  const router = useRouter();
  const items = useMemo(
    () => GAME_ITEMS.filter(x => x.id !== 'game-hub'),
    []
  );

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
      <Text style={s.h1}>Game Hub</Text>
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0b0b' },
  h1: { color: '#fff', fontSize: 24, fontWeight: '700', padding: 16 },
  card: { borderRadius: 16, padding: 16, overflow: 'hidden', backgroundColor: '#111827' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { color: '#fff', fontSize: 16, fontWeight: '700' },
  sub: { color: '#d1d5db', marginTop: 6 },
});
