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
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
export default function VocabularyScreen() {
  const router = useRouter();
  const [vocabList, setVocabList] = useState([]);
  const [allVocab, setAllVocab] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [topic, setTopic] = useState('');
  const [lesson, setLesson] = useState('');

  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const fetchVocabulary = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'vocabulary'));
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllVocab(list);
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
    const filtered = allVocab.filter(
      item =>
        (!selectedTopic || item.topic === selectedTopic) &&
        (item.word.toLowerCase().includes(search.toLowerCase()) ||
          item.meaning.toLowerCase().includes(search.toLowerCase()))
    );

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setVocabList(filtered.slice(startIndex, endIndex));
  }, [search, selectedTopic, currentPage, allVocab]);

  const uniqueTopics = [...new Set(allVocab.map(item => item.topic))];

  const openAddModal = () => {
    setEditingItem(null);
    setWord('');
    setMeaning('');
    setTopic('');
    setLesson('');
    setModalVisible(true);
  };

  const openEditModal = item => {
    setEditingItem(item);
    setWord(item.word);
    setMeaning(item.meaning);
    setTopic(item.topic);
    setLesson(item.lesson);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!word.trim() || !meaning.trim()) return;
    try {
      if (editingItem) {
        await updateDoc(doc(db, 'vocabulary', editingItem.id), {
          word,
          meaning,
          topic,
          lesson,
        });
      } else {
        await addDoc(collection(db, 'vocabulary'), {
          word,
          meaning,
          topic,
          lesson,
        });
      }
      setModalVisible(false);
      fetchVocabulary();
    } catch (e) {
      console.error('Lỗi khi lưu từ:', e);
    }
  };

  const handleDelete = async id => {
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
    const totalItems = allVocab.filter(
      item =>
        (!selectedTopic || item.topic === selectedTopic) &&
        (item.word.toLowerCase().includes(search.toLowerCase()) ||
          item.meaning.toLowerCase().includes(search.toLowerCase()))
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
          keyExtractor={item => item.id}
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
              <TextInput
                placeholder="Từ vựng"
                value={word}
                onChangeText={setWord}
                style={styles.input}
                placeholderTextColor={'#888'}
              />
              <TextInput
                placeholder="Nghĩa tiếng Việt"
                value={meaning}
                onChangeText={setMeaning}
                style={styles.input}
                placeholderTextColor={'#888'}
              />
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

