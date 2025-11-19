// app/(tabs)/WordBookScreen.tsx

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from '@/components/style/WorkBookStyles';
import {
  getGrammarByLevel,
  type GrammarPoint,
} from '@/hooks/grammar/useLevelGrammar';
import { useAuthProfile } from '@/hooks/tab/useAuthProfile';
import {
  getVocabByLevel,
  type VocabWord,
} from '@/hooks/useLevelVocabulary';

export default function WordBookScreen() {
  const router = useRouter();
  const { level } = useAuthProfile();

  const [tab, setTab] = useState<'voc' | 'gra'>('voc');

  const { vocab, topics, cefrLevel } = getVocabByLevel(level);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const filteredWords = useMemo(() => {
    if (!selectedTopic) return vocab;
    return vocab.filter((w) => w.topic === selectedTopic);
  }, [selectedTopic, vocab]);

  const { items: grammarItems } = getGrammarByLevel(level);

  const renderTab = () => (
    <View style={styles.tabWrap}>
      <TouchableOpacity
        style={[styles.tabBtn, tab === 'voc' && styles.tabBtnActive]}
        onPress={() => setTab('voc')}
      >
        <Text style={[styles.tabText, tab === 'voc' && styles.tabTextActive]}>
          Từ vựng
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tabBtn, tab === 'gra' && styles.tabBtnActive]}
        onPress={() => setTab('gra')}
      >
        <Text style={[styles.tabText, tab === 'gra' && styles.tabTextActive]}>
          Ngữ pháp
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderTopicCard = ({
    item,
    index,
  }: {
    item: string;
    index: number;
  }) => {
    const pastelColors = ['#FDECEF', '#FFF5DC', '#EAF7EE', '#E8F4FF', '#F1EDFF'];
    const bg = pastelColors[index % pastelColors.length];

    return (
      <TouchableOpacity
        style={[styles.topicCard, { backgroundColor: bg }]}
        onPress={() => setSelectedTopic(item)}
      >
        <View>
          <Text style={styles.topicCardTitle}>{item}</Text>
          <Text style={styles.topicCardSub}>
            {vocab.filter((v) => v.topic === item).length} từ
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#4B5563" />
      </TouchableOpacity>
    );
  };

  const renderWordItem = ({ item }: { item: VocabWord }) => (
    <TouchableOpacity
      style={styles.wordCard}
      onPress={() => router.push(`/vocab/detail/${item.id}`)}
    >
      <View style={styles.wordLeft}>
        <Text style={styles.wordText}>{item.word}</Text>
        {!!item.phonetic && (
          <Text style={styles.wordPhonetic}>{item.phonetic}</Text>
        )}
      </View>
      <Ionicons name="arrow-forward" size={18} color="#4B5563" />
    </TouchableOpacity>
  );

  const renderGrammarItem = ({ item }: { item: GrammarPoint }) => (
    <TouchableOpacity
      style={styles.grammarCard}
      onPress={() => router.push({ pathname: '/(tabs)/grammar/detail/[id]', params: { id: item.id } })}
    >
      <Text style={styles.grammarTag}>A1 • Grammar</Text>
      <Text style={styles.grammarTitle}>{item.title}</Text>
      <Text style={styles.grammarPattern}>{item.pattern}</Text>
      <Text style={styles.grammarSummary}>{item.summary}</Text>

      <View style={styles.grammarExampleBlock}>
        <Text style={styles.grammarExampleEn}>{item.exampleEn}</Text>
        <Text style={styles.grammarExampleVi}>{item.exampleVi}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {renderTab()}

        {/* TAB: VOCAB */}
        {tab === 'voc' && (
          <>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Từ vựng Level {cefrLevel}</Text>
              <Text style={styles.headerSubtitle}>
                Chọn chủ đề để bắt đầu học.
              </Text>
            </View>

            {!selectedTopic && (
              <FlatList
                data={topics}
                keyExtractor={(item) => item}
                renderItem={renderTopicCard}
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
              />
            )}

            {selectedTopic && (
              <>
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => setSelectedTopic(null)}
                >
                  <Ionicons name="arrow-back" size={18} />
                  <Text style={styles.backBtnText}>Chủ đề</Text>
                </TouchableOpacity>

                <FlatList
                  data={filteredWords}
                  keyExtractor={(item) => item.id}
                  renderItem={renderWordItem}
                  contentContainerStyle={{ paddingBottom: 80 }}
                  showsVerticalScrollIndicator={false}
                />
              </>
            )}
          </>
        )}

        {/* TAB: GRAMMAR */}
        {tab === 'gra' && (
          <>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Ngữ pháp Level {cefrLevel}</Text>
              <Text style={styles.headerSubtitle}>
                Các điểm ngữ pháp cơ bản bạn cần nắm ở trình độ này.
              </Text>
            </View>

            <FlatList
              data={grammarItems}
              keyExtractor={(item) => item.id}
              renderItem={renderGrammarItem}
              contentContainerStyle={{ paddingBottom: 80 }}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
