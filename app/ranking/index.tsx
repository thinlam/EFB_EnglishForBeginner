// app/ranking/index.tsx
import { styles } from '@/components/style/ranking.styles';
import { useRanking } from '@/hooks/ranking/useRanking';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RankingScreen() {
  const { data, loading } = useRanking();
  const router = useRouter();

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={styles.loading}>Loading ranking...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={26} color="#FACC15" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Global Ranking</Text>

        {/* giữ layout cân bằng */}
        <View style={{ width: 26 }} />
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.uid}
        contentContainerStyle={[
          styles.container,
          data.length === 0 && { flex: 1 },
        ]}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Chưa có dữ liệu ranking
          </Text>
        }
        renderItem={({ item, index }) => {
          const rank = index + 1;
          const isTop3 = rank <= 3;

          return (
            <LinearGradient
              colors={
                isTop3
                  ? ['#F59E0B', '#EF4444']
                  : ['#1F2937', '#111827']
              }
              style={styles.row}
            >
              <Text style={styles.rank}>#{rank}</Text>

              {item.photoURL ? (
                <Image
                  source={{ uri: item.photoURL }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarText}>
                    {item.displayName?.[0]?.toUpperCase() || 'U'}
                  </Text>
                </View>
              )}

              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.displayName}</Text>
                <Text style={styles.sub}>
                  XP {item.cefrXp} • {item.testCompleted} tests
                </Text>
              </View>

              <Text style={styles.score}>{item.avgScore}</Text>
            </LinearGradient>
          );
        }}
      />
    </SafeAreaView>
  );
}
