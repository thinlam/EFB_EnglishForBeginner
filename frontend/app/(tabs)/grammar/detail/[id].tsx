// app/(tabs)/grammar/detail/[id].tsx

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// eslint-disable-next-line import/no-unresolved
import { styles } from '@/components/style/grammar/GrammarDetailStyles';
// eslint-disable-next-line import/no-unresolved
import { getGrammarByLevel, type GrammarPoint } from '@/hooks/grammar/useLevelGrammar';
// eslint-disable-next-line import/no-unresolved
import { useAuthProfile } from '@/hooks/tab/useAuthProfile';

export default function GrammarDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { level } = useAuthProfile();
  const { items, cefrLevel } = getGrammarByLevel(level);

  const grammar = useMemo<GrammarPoint | undefined>(
    () => items.find((g) => g.id === id),
    [items, id]
  );

  if (!grammar) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text>Không tìm thấy mục ngữ pháp.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/WordBook')}>
  <Ionicons name="arrow-back" size={22} color="#111827" />
</TouchableOpacity>


          <Text style={styles.headerTitle}>Ngữ pháp {cefrLevel}</Text>

          <View style={{ width: 24 }} />
        </View>

        {/* Tag */}
        <Text style={styles.levelTag}>A1 • Grammar</Text>

        {/* Title */}
        <Text style={styles.title}>{grammar.title}</Text>

        {/* Pattern */}
        <View style={styles.patternBlock}>
          <Text style={styles.patternLabel}>Cấu trúc:</Text>
          <Text style={styles.patternText}>{grammar.pattern}</Text>
        </View>

        {/* Giải thích tiếng Việt */}
        <View style={styles.explainBlock}>
          <Text style={styles.sectionTitle}>Giải thích</Text>
          <Text style={styles.explainText}>{grammar.explanationVi}</Text>
        </View>

        {/* Ví dụ */}
        <View style={styles.exampleBlock}>
          <Text style={styles.sectionTitle}>Ví dụ</Text>
          <Text style={styles.exampleEn}>{grammar.exampleEn}</Text>
          <Text style={styles.exampleVi}>{grammar.exampleVi}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
