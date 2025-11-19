// app/(tabs)/vocab/WordDetailScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { styles } from '@/components/style/vocab/WordDetailStyles';
import { useAuthProfile } from '@/hooks/tab/useAuthProfile';
import { getVocabByLevel } from '@/hooks/useLevelVocabulary';

/** ---------- Types cho vocab ---------- */

type VerbForms = {
  base: string;
  thirdPerson: string;
  presentParticiple: string;
  past: string;
  pastParticiple: string;
};

type VocabItem = {
  id: string | number;
  word: string;
  phonetic?: string;
  meaningVi: string;
  pos?: string;
  exampleEn?: string;
  exampleVi?: string;
  topic?: string;
  createdAt?: string;
  forms?: VerbForms; // 👉 để hiển thị eat / ate / eaten...
};

export default function WordDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const { level } = useAuthProfile();
  const { vocab } = getVocabByLevel(level);

  const word = useMemo<VocabItem | undefined>(
    () => (vocab as VocabItem[]).find((v) => String(v.id) === String(id)),
    [id, vocab]
  );

  if (!word) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Không tìm thấy từ vựng.</Text>
      </View>
    );
  }

  const showPos = !!word.pos;
  const showForms = !!word.forms && word.pos === 'verb';

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{word.word}</Text>

        <View style={{ width: 24 }} />
      </View>

      {/* Từ chính */}
      <Text style={styles.word}>{word.word}</Text>

      {/* Phiên âm + loa */}
      {word.phonetic && (
        <View style={styles.phoneticRow}>
          <Text style={styles.phonetic}>{word.phonetic}</Text>

          <TouchableOpacity
            onPress={() => {
              // TODO: sau này gắn text-to-speech
              // playSound(word.word);
            }}
          >
            <Ionicons name="volume-high" size={22} color="#2563EB" />
          </TouchableOpacity>
        </View>
      )}

      {/* Từ loại (nếu có) */}
      {showPos && (
        <View style={styles.posPill}>
          <Text style={styles.posText}>{word.pos}</Text>
        </View>
      )}

      {/* Nghĩa chính */}
      <Text style={styles.meaning}>{word.meaningVi}</Text>

      {/* Verb forms (nếu là động từ và có forms) */}
      {showForms && word.forms && (
        <View style={styles.verbFormsBlock}>
          <Text style={styles.verbFormsTitle}>Verb forms</Text>

          <Text style={styles.verbFormsLine}>
            <Text style={styles.verbFormsLabel}>Base: </Text>
            {word.forms.base}
          </Text>

          <Text style={styles.verbFormsLine}>
            <Text style={styles.verbFormsLabel}>3rd person: </Text>
            {word.forms.thirdPerson}
          </Text>

          <Text style={styles.verbFormsLine}>
            <Text style={styles.verbFormsLabel}>V-ing: </Text>
            {word.forms.presentParticiple}
          </Text>

          <Text style={styles.verbFormsLine}>
            <Text style={styles.verbFormsLabel}>V2 (past): </Text>
            {word.forms.past}
          </Text>

          <Text style={styles.verbFormsLine}>
            <Text style={styles.verbFormsLabel}>V3 (past participle): </Text>
            {word.forms.pastParticiple}
          </Text>
        </View>
      )}

      {/* Ví dụ */}
      {word.exampleEn && (
        <View style={styles.exampleBlock}>
          <Text style={styles.exampleEn}>{word.exampleEn}</Text>
          {!!word.exampleVi && (
            <Text style={styles.exampleVi}>{word.exampleVi}</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}
