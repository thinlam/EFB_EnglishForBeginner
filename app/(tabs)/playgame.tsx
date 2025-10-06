import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from '@/components/style/tab/playgame';
import { GAME_ITEMS } from '@/constants/tab/playgame';
import type { GameItem } from '@/types/tab/playgame';

export const options = {
  title: 'Game',
  tabBarLabel: 'Game',
  tabBarIcon: ({ color, size }: { color: string; size: number }) => (
    <Ionicons name="game-controller" size={size} color={color} />
  ),
};

export default function PlayGameScreen() {
  const router = useRouter();
  const data = useMemo(() => GAME_ITEMS, []);

  const renderItem = ({ item }: { item: GameItem }) => (
  <TouchableOpacity
    activeOpacity={0.9}
    style={styles.card}
    onPress={() => router.push(item.route)} // <- điều hướng theo route riêng
  >
    <LinearGradient
      colors={item.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
    <View style={styles.cardHeader}>
      <Ionicons name={item.icon as any} size={24} color="#fff" />
      <Text style={styles.cardTitle}>{item.title}</Text>
    </View>
    <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
    <View style={styles.pillRow}>
      {item.levels?.map((lv) => (
        <View key={lv} style={styles.pill}>
          <Text style={styles.pillText}>{lv}</Text>
        </View>
      ))}
    </View>
  </TouchableOpacity>
);


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header + Nút Back */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={24} color="#070707ff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Play & Learn</Text>
          <Text style={styles.headerCaption}>Mini games giúp ôn tập và rèn luyện </Text>
        </View>
      </View>

      <FlatList
        contentContainerStyle={[styles.listContent, { paddingBottom: 24 }]}
        contentInsetAdjustmentBehavior="automatic"
        data={data}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
