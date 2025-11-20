import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from '@/components/style/vocab/WordDetailStyles';
import { useAuthProfile } from '@/hooks/tab/useAuthProfile';
import { getVocabByLevel } from '@/hooks/useLevelVocabulary';

export default function WordDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const { level } = useAuthProfile();
  const { vocab } = getVocabByLevel(level);

  const word = useMemo(
    () => vocab.find((v) => String(v.id) === String(id)),
    [id, vocab]
  );

  if (!word) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text>Không tìm thấy từ vựng.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{word.word}</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Word */}
        <Text style={styles.word}>{word.word}</Text>

        {/* Phonetic */}
        {word.phonetic && (
          <View style={styles.phoneticRow}>
            <Text style={styles.phonetic}>{word.phonetic}</Text>
            <Ionicons name="volume-high" size={22} color="#2563EB" />
          </View>
        )}

        {/* ENTRIES */}
        {word.entries.map((entry, idx) => (
          <View key={idx} style={styles.entryBlock}>

            {/* POS */}
            <Text style={styles.entryPOS}>{entry.pos}</Text>

            {/* Verb forms */}
            {entry.forms && (
              <Text style={styles.formsLine}>
                <Text style={styles.formsLabel}>V1:</Text> {entry.forms.base}   {' '}
                <Text style={styles.formsLabel}>V2:</Text> {entry.forms.past}   {' '}
                <Text style={styles.formsLabel}>V3:</Text> {entry.forms.pastParticiple}
              </Text>
            )}

            {/* Meanings */}
            {entry.meanings.map((m, i) => (
              <View key={i} style={styles.meaningItem}>
                <Text style={styles.meaningDefinition}>
                  {i + 1}. {m.definition}
                </Text>

                {m.exampleEn && (
                  <Text style={styles.exampleEn}>{m.exampleEn}</Text>
                )}
                {m.exampleVi && (
                  <Text style={styles.exampleVi}>{m.exampleVi}</Text>
                )}
              </View>
            ))}

            {/* Idioms */}
            {entry.idioms && entry.idioms.length > 0 && (
              <View style={styles.idiomBlock}>
                <Text style={styles.idiomTitle}>Thành ngữ</Text>

                {entry.idioms.map((idiom, j) => (
                  <View key={j} style={styles.idiomItem}>
                    <Text style={styles.idiomPhrase}>{idiom.phrase}</Text>
                    <Text style={styles.idiomMeaning}>{idiom.meaning}</Text>

                    {idiom.exampleEn && (
                      <Text style={styles.exampleEn}>{idiom.exampleEn}</Text>
                    )}
                    {idiom.exampleVi && (
                      <Text style={styles.exampleVi}>{idiom.exampleVi}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}

          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}
