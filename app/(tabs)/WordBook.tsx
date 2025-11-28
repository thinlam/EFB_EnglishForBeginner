// app/(tabs)/WordBookScreen.tsx

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from '@/components/style/WorkBookStyles';

/* Vocabulary */
import {
  getVocabByLevel,
  type VocabWord,
} from '@/hooks/useLevelVocabulary';

/* Grammar */
import {
  getGrammarByLevel,
  type GrammarPoint,
} from '@/hooks/grammar/useLevelGrammar';

/* User profile */
import { useAuthProfile } from '@/hooks/tab/useAuthProfile';

/* Firebase */
import { db } from '@/scripts/firebase';
import { collection, getDocs } from 'firebase/firestore';

type StudyDoc = {
  id: string;
  title: string;
  type: string;
  url?: string;
  level?: string;
};

export default function WordBookScreen() {
  const router = useRouter();
  const { level } = useAuthProfile(); // "1", "2", "3"...

  const [tab, setTab] = useState<'voc' | 'gra' | 'study'>('voc');

  /* ------------------- MAPPING LEVEL ------------------- */
  const mapLevel = (lv: string | number): string => {
    const s = String(lv).trim();
    switch (s) {
      case "1": return "A1";
      case "2": return "A2";
      case "3": return "B1";
      case "4": return "B2";
      case "5": return "C1";
      default:  return s.toUpperCase();
    }
  };

  const finalLevel = mapLevel(level);
  console.log("🔥 USER LEVEL =", level, "→ mapped =", finalLevel);

  /* ====================== VOCAB ====================== */
  const { vocab, topics, cefrLevel } = getVocabByLevel(level);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const filteredWords = useMemo(() => {
    if (!selectedTopic) return vocab;
    return vocab.filter((w) => w.topic === selectedTopic);
  }, [selectedTopic, vocab]);

  const renderTopicCard = ({ item, index }: { item: string; index: number }) => {
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

  /* ====================== GRAMMAR ====================== */
  const { items: grammarItems } = getGrammarByLevel(level);

  const renderGrammarItem = ({ item }: { item: GrammarPoint }) => (
    <TouchableOpacity
      style={styles.grammarCard}
      onPress={() =>
        router.push({
          pathname: '/(tabs)/grammar/detail/[id]',
          params: { id: item.id },
        })
      }
    >
      <Text style={styles.grammarTag}>{finalLevel} • Grammar</Text>
      <Text style={styles.grammarTitle}>{item.title}</Text>
      <Text style={styles.grammarPattern}>{item.pattern}</Text>
      <Text style={styles.grammarSummary}>{item.summary}</Text>

      <View style={styles.grammarExampleBlock}>
        <Text style={styles.grammarExampleEn}>{item.exampleEn}</Text>
        <Text style={styles.grammarExampleVi}>{item.exampleVi}</Text>
      </View>
    </TouchableOpacity>
  );

  /* ====================== STUDY MATERIAL ====================== */
  const [materials, setMaterials] = useState<StudyDoc[]>([]);
  const [loadingStudy, setLoadingStudy] = useState(false);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoadingStudy(true);

        // Lấy toàn bộ rồi filter — tránh mismatch query Firestore
        const snap = await getDocs(collection(db, "studyMaterials"));

        const list: StudyDoc[] = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as any) }))
          .filter((doc) =>
            String(doc.level).trim().toUpperCase() === finalLevel
          );

        console.log("🔥 MATERIALS FILTERED =", list);

        setMaterials(list);
      } catch (e) {
        console.log('🔥 Lỗi lấy tài liệu:', e);
      } finally {
        setLoadingStudy(false);
      }
    };

    fetchMaterials();
  }, [level]);

  const renderStudyItem = ({ item }: { item: StudyDoc }) => (
    <TouchableOpacity
      style={styles.wordCard}
      onPress={() => router.push(`/study/${item.id}`)}
    >
      <View style={styles.wordLeft}>
        <Text style={styles.wordText}>{item.title}</Text>
        <Text style={styles.wordPhonetic}>{item.type?.toUpperCase()}</Text>
      </View>
      <Ionicons name="arrow-forward" size={18} color="#4B5563" />
    </TouchableOpacity>
  );

  /* ====================== TAB UI ====================== */
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

      <TouchableOpacity
        style={[styles.tabBtn, tab === 'study' && styles.tabBtnActive]}
        onPress={() => setTab('study')}
      >
        <Text style={[styles.tabText, tab === 'study' && styles.tabTextActive]}>
          Tài liệu
        </Text>
      </TouchableOpacity>
    </View>
  );

  /* ====================== MAIN RENDER ====================== */
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {renderTab()}

        {/* ================= VOCAB ================= */}
        {tab === 'voc' && (
          <>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Từ vựng Level {cefrLevel}</Text>
              <Text style={styles.headerSubtitle}>Chọn chủ đề để bắt đầu học.</Text>
            </View>

            {!selectedTopic ? (
              <FlatList
                data={topics}
                keyExtractor={(item) => item}
                renderItem={renderTopicCard}
              />
            ) : (
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
                />
              </>
            )}
          </>
        )}

        {/* ================= GRAMMAR ================= */}
        {tab === 'gra' && (
          <>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Ngữ pháp Level {cefrLevel}</Text>
              <Text style={styles.headerSubtitle}>Các điểm ngữ pháp bạn cần nắm.</Text>
            </View>

            <FlatList
              data={grammarItems}
              keyExtractor={(item) => item.id}
              renderItem={renderGrammarItem}
            />
          </>
        )}

        {/* ================= STUDY ================= */}
        {tab === 'study' && (
          <>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Tài liệu học</Text>
              <Text style={styles.headerSubtitle}>
                Dành cho Level {finalLevel}.
              </Text>
            </View>

            <FlatList
              data={materials}
              keyExtractor={(item) => item.id}
              renderItem={renderStudyItem}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
