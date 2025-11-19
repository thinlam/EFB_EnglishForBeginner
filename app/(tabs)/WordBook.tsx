/**
 * Dự án: EFB - English For Beginners
 * Màn hình: Vocabulary theo cấp độ CEFR
 * Chức năng: Chọn chủ đề → xem từ vựng theo level & topic.
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from '@/components/style/WorkBookStyles';
import { useAuthProfile } from '@/hooks/tab/useAuthProfile';
import {
  getVocabByLevel,
  type VocabWord,
} from '@/hooks/useLevelVocabulary';

/** Random pastel mượt, ổn định theo index */
function getPastelColor(seed: number) {
  const hue = (seed * 53) % 360; // đổi góc màu
  const saturation = 38; // pastel → bão hoà thấp
  const lightness = 88; // sáng
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export default function WordBookScreen() {
  const router = useRouter();
  const { level } = useAuthProfile(); // có thể là '1', '2', 'A1',...
  const { vocab, topics, cefrLevel } = getVocabByLevel(level);

  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const filteredWords = useMemo(() => {
    if (!selectedTopic) return vocab;
    return vocab.filter((w) => w.topic === selectedTopic);
  }, [selectedTopic, vocab]);

  const renderTopicCard = ({
    item,
    index,
  }: {
    item: string;
    index: number;
  }) => {
    const bg = getPastelColor(index);

    return (
      <TouchableOpacity
        style={[styles.topicCard, { backgroundColor: bg }]}
        onPress={() => setSelectedTopic(item)}
      >
        <Text style={styles.topicCardTitle}>{item}</Text>

        <View style={styles.topicCardBadge}>
          <Text style={styles.topicCardBadgeText}>
            {vocab.filter((v) => v.topic === item).length} từ
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderWordItem = ({ item }: { item: VocabWord }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/vocab/detail/${item.id}`)}
    >
      <View style={styles.cardHeaderRow}>
        <View style={styles.wordBlock}>
          <Text style={styles.wordText}>{item.word}</Text>
          {!!item.phonetic && (
            <Text style={styles.phoneticText}>{item.phonetic}</Text>
          )}
        </View>

        {!!item.topic && (
          <View style={styles.topicPill}>
            <Ionicons name="pricetag-outline" size={12} />
            <Text style={styles.topicText}>{item.topic}</Text>
          </View>
        )}
      </View>

      <Text style={styles.meaningText}>{item.meaningVi}</Text>

      {!!item.exampleEn && (
        <View style={styles.exampleBlock}>
          <Text style={styles.exampleEnText}>{item.exampleEn}</Text>
          {!!item.exampleVi && (
            <Text style={styles.exampleViText}>{item.exampleVi}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="book-outline" size={28} />
      </View>
      <Text style={styles.emptyTitle}>Chưa có từ vựng nào cho level này</Text>
      <Text style={styles.emptySubtitle}>
        Hãy thêm dữ liệu từ vựng trong constants/vocab để hiển thị nội dung.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerWrap}>
          <View style={styles.headerAccent} />
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>Từ vựng Level {cefrLevel}</Text>
            <Text style={styles.headerSubtitle}>
              Chọn chủ đề để bắt đầu học từ vựng phù hợp với level.
            </Text>
          </View>
          <View style={styles.headerRightSpace} />
        </View>

        {/* MODE 1: chưa chọn chủ đề → list topic dọc, có scroll */}
        {!selectedTopic && (
          <FlatList
            data={topics}
            keyExtractor={(item) => item}
            renderItem={renderTopicCard}
            contentContainerStyle={styles.topicListContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmpty}
          />
        )}

        {/* MODE 2: đã chọn 1 chủ đề → list từ vựng của chủ đề đó */}
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
              contentContainerStyle={
                filteredWords.length === 0
                  ? styles.listEmptyContainer
                  : styles.listContainer
              }
              ListEmptyComponent={renderEmpty}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
