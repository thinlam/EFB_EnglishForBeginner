// app/(admin)/vocabulary.tsx
import { styles } from '@/components/style/VocabularyStyles';
import { db } from '@/scripts/firebase';
import { useRouter } from 'expo-router';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

/* ======== Config dịch (có thể đổi sang server riêng) ======== */
const TRANSLATE_ENDPOINT = 'https://api.mymemory.translated.net/get';
async function translateEnToVi(text: string): Promise<string | null> {
  try {
    const url = `${TRANSLATE_ENDPOINT}?q=${encodeURIComponent(text)}&langpair=en|vi`;
    const res = await fetch(url, { method: 'GET' });
    const json = await res.json();
    const raw: string | undefined = json?.responseData?.translatedText;
    if (!raw) return null;
    // Chuẩn hoá đơn giản
    const cleaned = raw
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&')
      .trim();
    return cleaned || null;
  } catch {
    return null;
  }
}

export default function VocabularyScreen() {
  const router = useRouter();
  const [vocabList, setVocabList] = useState<any[]>([]);
  const [allVocab, setAllVocab] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [topic, setTopic] = useState('');
  const [lesson, setLesson] = useState('');

  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  /* ======== Trạng thái auto-translate ======== */
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestedMeaning, setSuggestedMeaning] = useState('');
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchVocabulary = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'vocabulary'));
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAllVocab(list as any[]);
    } catch (err) {
      console.error('Lỗi khi lấy từ vựng:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVocabulary();
  }, []);

  useEffect(() => {
    const filtered = allVocab.filter((item: any) =>
      (!selectedTopic || item.topic === selectedTopic) &&
      (
        (item.word || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.meaning || '').toLowerCase().includes(search.toLowerCase())
      )
    );

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setVocabList(filtered.slice(startIndex, endIndex));
  }, [search, selectedTopic, currentPage, allVocab]);

  const uniqueTopics = useMemo(
    () => [...new Set(allVocab.map((item: any) => item.topic || ''))],
    [allVocab]
  );

  const openAddModal = () => {
    setEditingItem(null);
    setWord('');
    setMeaning('');
    setTopic('');
    setLesson('');
    setSuggestedMeaning('');
    setModalVisible(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setWord(item.word || '');
    setMeaning(item.meaning || '');
    setTopic(item.topic || '');
    setLesson(item.lesson || '');
    setSuggestedMeaning('');
    setModalVisible(true);
  };

  /* ======== Debounce & gợi ý nghĩa tiếng Việt ======== */
  useEffect(() => {
    if (!autoTranslate) return;
    if (!word || !word.trim()) {
      setSuggestedMeaning('');
      return;
    }
    // Nếu user đang sửa nghĩa thủ công thì không auto đè
    if (meaning.trim().length > 0) return;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      setSuggesting(true);
      const r = await translateEnToVi(word.trim());
      setSuggesting(false);
      setSuggestedMeaning(r || '');
    }, 500); // 500ms debounce
  }, [word, autoTranslate]); // không phụ thuộc meaning để tránh vòng lặp

  const acceptSuggestion = () => {
    if (suggestedMeaning) setMeaning(suggestedMeaning);
  };

  const handleSave = async () => {
    if (!word.trim() || !((meaning || suggestedMeaning).trim())) return;
    const payload = {
      word: word.trim(),
      meaning: (meaning || suggestedMeaning).trim(),
      topic: (topic || '').trim(),
      lesson: (lesson || '').trim(),
    };
    try {
      if (editingItem) {
        await updateDoc(doc(db, 'vocabulary', editingItem.id), payload);
      } else {
        await addDoc(collection(db, 'vocabulary'), payload);
      }
      setModalVisible(false);
      fetchVocabulary();
    } catch (e) {
      console.error('Lỗi khi lưu từ:', e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'vocabulary', id));
      fetchVocabulary();
    } catch (e) {
      console.error('Lỗi khi xoá:', e);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNextPage = () => {
    const totalItems = allVocab.filter((item: any) =>
      (!selectedTopic || item.topic === selectedTopic) &&
      (
        (item.word || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.meaning || '').toLowerCase().includes(search.toLowerCase())
      )
    ).length;
    if (currentPage < Math.ceil(totalItems / ITEMS_PER_PAGE)) setCurrentPage(prev => prev + 1);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>📚 Quản lý từ vựng</Text>

        <TextInput
          style={styles.input}
          placeholder="🔍 Tìm từ vựng..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={'#888'}
        />

        <View style={styles.pickerContainer}>
          <TextInput
            style={styles.input}
            placeholder="Chọn chủ đề..."
            value={selectedTopic}
            onChangeText={setSelectedTopic}
            placeholderTextColor={'#888'}
          />
        </View>

        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>➕ Thêm từ vựng</Text>
        </TouchableOpacity>

        <FlatList
          data={vocabList}
          keyExtractor={(item: any) => item.id}
          refreshing={loading}
          onRefresh={fetchVocabulary}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.word}>{item.word}</Text>
                <Text style={styles.meaning}>{item.meaning}</Text>
                <Text style={styles.sub}>📂 {item.topic}  |  📘 {item.lesson}</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(item)}>
                  <Text style={styles.editText}>Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                  <Text style={styles.deleteText}>Xoá</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />

        <TouchableOpacity onPress={() => router.push('/(admin)/home')} style={styles.backButton}>
          <Text style={styles.backButtonText}>⬅ Quay lại</Text>
        </TouchableOpacity>

        <View style={styles.pagination}>
          <TouchableOpacity onPress={handlePrevPage} style={styles.pageButton}>
            <Text>⬅</Text>
          </TouchableOpacity>
          <Text>Trang {currentPage}</Text>
          <TouchableOpacity onPress={handleNextPage} style={styles.pageButton}>
            <Text>➡</Text>
          </TouchableOpacity>
        </View>

        {/* Modal thêm/sửa */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>{editingItem ? '✏️ Sửa từ' : '📝 Thêm từ mới'}</Text>

              {/* Toggle auto-translate */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <TouchableOpacity
                  onPress={() => setAutoTranslate(v => !v)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: 8,
                    backgroundColor: autoTranslate ? '#2e7d32' : '#555'
                  }}
                >
                  <Text style={{ color: '#fff' }}>
                    {autoTranslate ? 'Auto‑dịch: BẬT' : 'Auto‑dịch: TẮT'}
                  </Text>
                </TouchableOpacity>
                {suggesting ? (
                  <View style={{ marginLeft: 10 }}>
                    <ActivityIndicator />
                  </View>
                ) : null}
              </View>

              <TextInput
                placeholder="Từ vựng (EN)"
                value={word}
                onChangeText={setWord}
                style={styles.input}
                placeholderTextColor={'#888'}
                autoCapitalize="none"
              />

              <TextInput
                placeholder="Nghĩa tiếng Việt"
                value={meaning}
                onChangeText={setMeaning}
                style={styles.input}
                placeholderTextColor={'#888'}
              />

              {/* Gợi ý nghĩa (bấm để dán) */}
              {autoTranslate && !meaning.trim() && suggestedMeaning ? (
                <TouchableOpacity
                  onPress={acceptSuggestion}
                  style={{
                    alignSelf: 'flex-start',
                    backgroundColor: '#e8f5e9',
                    borderRadius: 8,
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: '#c8e6c9'
                  }}
                >
                  <Text style={{ color: '#1b5e20' }}>
                    Gợi ý: {suggestedMeaning} (bấm để dán)
                  </Text>
                </TouchableOpacity>
              ) : null}

              <TextInput
                placeholder="Chủ đề (VD: Food)"
                value={topic}
                onChangeText={setTopic}
                style={styles.input}
                placeholderTextColor={'#888'}
              />
              <TextInput
                placeholder="Bài học (VD: Lesson 1)"
                value={lesson}
                onChangeText={setLesson}
                style={styles.input}
                placeholderTextColor={'#888'}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.addButton, { backgroundColor: 'green' }]} onPress={handleSave}>
                  <Text style={styles.addButtonText}>Lưu</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.addButton, { backgroundColor: 'gray' }]} onPress={() => setModalVisible(false)}>
                  <Text style={styles.addButtonText}>Huỷ</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
