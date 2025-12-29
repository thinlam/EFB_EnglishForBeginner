import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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

  const renderItem = ({ item }: { item: GameItem }) => {
    const disabled = item.comingSoon === true;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        disabled={disabled}
        style={[styles.card, disabled && { opacity: 0.5 }]}
        onPress={() => {
          if (!disabled) {
            router.push(item.route as any);
          }
        }}
      >
        <LinearGradient
          colors={item.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {disabled && (
          <View style={local.badge}>
            <Text style={local.badgeText}>COMING SOON</Text>
          </View>
        )}

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
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Play & Learn</Text>
          <Text style={styles.headerCaption}>
            Mini games giúp ôn tập và rèn luyện
          </Text>
        </View>
      </View>

      <FlatList
        data={data}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={[styles.listContent, { paddingBottom: 24 }]}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const local = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    zIndex: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});
