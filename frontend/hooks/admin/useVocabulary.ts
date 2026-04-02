import { translateBidirectional } from '@/services/admin/translateService'; // dịch sang vi 
import { addVocab, deleteVocab, fetchVocab, updateVocab } from '@/services/admin/vocabService';
import type { Vocab } from '@/types/admin/vocab';
import React from 'react';
import { Alert } from 'react-native';

const ITEMS_PER_PAGE = 10;

export function useVocabulary() {
  // data
  const [allVocab, setAllVocab] = React.useState<Vocab[]>([]);
  const [vocabList, setVocabList] = React.useState<Vocab[]>([]);
  const [loading, setLoading] = React.useState(true);

  // filters
  const [search, setSearch] = React.useState('');
  const [selectedTopic, setSelectedTopic] = React.useState('');

  // pagination
  const [currentPage, setCurrentPage] = React.useState(1);

  // modal + form
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<Vocab | null>(null);
  const [word, setWord] = React.useState('');
  const [meaning, setMeaning] = React.useState('');
  const [topic, setTopic] = React.useState('');
  const [lesson, setLesson] = React.useState('');

  // auto-translate suggest
  const [autoTranslate, setAutoTranslate] = React.useState(true);
  const [suggesting, setSuggesting] = React.useState(false);
  const [suggestedMeaning, setSuggestedMeaning] = React.useState('');
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchVocab();
      setAllVocab(list);
    } catch (e) {
      console.error('Lỗi khi lấy từ vựng:', e);
      Alert.alert('Lỗi', 'Không thể tải danh sách từ vựng.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { refresh(); }, [refresh]);

  // derived list
  React.useEffect(() => {
    const filtered = allVocab.filter((it) => {
      const byTopic = !selectedTopic || (it.topic || '') === selectedTopic;
      const q = search.toLowerCase();
      const byText =
        (it.word || '').toLowerCase().includes(q) ||
        (it.meaning || '').toLowerCase().includes(q);
      return byTopic && byText;
    });
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    setVocabList(filtered.slice(start, end));
  }, [allVocab, search, selectedTopic, currentPage]);

  const uniqueTopics = React.useMemo(
    () => Array.from(new Set(allVocab.map((it) => it.topic || ''))),
    [allVocab]
  );

  // modal
  const openAddModal = React.useCallback(() => {
    setEditingItem(null);
    setWord(''); setMeaning(''); setTopic(''); setLesson('');
    setSuggestedMeaning('');
    setModalVisible(true);
  }, []);
  const openEditModal = React.useCallback((item: Vocab) => {
    setEditingItem(item);
    setWord(item.word || ''); setMeaning(item.meaning || '');
    setTopic(item.topic || ''); setLesson(item.lesson || '');
    setSuggestedMeaning('');
    setModalVisible(true);
  }, []);
  const closeModal = React.useCallback(() => setModalVisible(false), []);

  //debounce suggest
  React.useEffect(() => {
    if (!autoTranslate) return;
    if (!word.trim()) { setSuggestedMeaning(''); return; }
    if (meaning.trim().length > 0) return; // không đè khi đã nhập tay
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        setSuggesting(true);
        const r = await translateBidirectional(word.trim(), "vi", "en");
        setSuggestedMeaning(r || '');
      } finally {
        setSuggesting(false);
      }
    }, 500);
    // cleanup
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [word, autoTranslate]); // không phụ thuộc meaning để tránh loop

  const toggleAutoTranslate = React.useCallback(() => setAutoTranslate(v => !v), []);
  const acceptSuggestion = React.useCallback(() => { if (suggestedMeaning) setMeaning(suggestedMeaning); }, [suggestedMeaning]);

  // save
  const handleSave = React.useCallback(async () => {
    if (!word.trim() || !((meaning || suggestedMeaning).trim())) return;
    const payload: Omit<Vocab, 'id'> = {
      word: word.trim(),
      meaning: (meaning || suggestedMeaning).trim(),
      topic: (topic || '').trim(),
      lesson: (lesson || '').trim(),
    };
    try {
      if (editingItem?.id) await updateVocab(editingItem.id, payload);
      else await addVocab(payload);
      setModalVisible(false);
      await refresh();
    } catch (e) {
      console.error('Lỗi khi lưu từ:', e);
      Alert.alert('Lỗi', 'Không thể lưu từ vựng.');
    }
  }, [word, meaning, suggestedMeaning, topic, lesson, editingItem, refresh]);

  // delete
  const handleDelete = React.useCallback(async (id: string) => {
    try {
      await deleteVocab(id);
      await refresh();
    } catch (e) {
      console.error('Lỗi khi xoá:', e);
      Alert.alert('Lỗi', 'Không thể xoá từ vựng.');
    }
  }, [refresh]);

  // pagination handlers
  const handlePrevPage = React.useCallback(() => { if (currentPage > 1) setCurrentPage(p => p - 1); }, [currentPage]);
  const handleNextPage = React.useCallback(() => {
    const total = allVocab.filter((it) => {
      const byTopic = !selectedTopic || (it.topic || '') === selectedTopic;
      const q = search.toLowerCase();
      const byText =
        (it.word || '').toLowerCase().includes(q) ||
        (it.meaning || '').toLowerCase().includes(q);
      return byTopic && byText;
    }).length;
    if (currentPage < Math.ceil(total / ITEMS_PER_PAGE)) setCurrentPage(p => p + 1);
  }, [allVocab, selectedTopic, search, currentPage]);

  return {
    // data
    vocabList, loading, uniqueTopics,
    // filters
    search, setSearch, selectedTopic, setSelectedTopic,
    // pagination
    currentPage, handlePrevPage, handleNextPage,
    // modal & form
    modalVisible, openAddModal, openEditModal, closeModal,
    word, setWord, meaning, setMeaning, topic, setTopic, lesson, setLesson,
    // suggest
    autoTranslate, toggleAutoTranslate, suggesting, suggestedMeaning, acceptSuggestion,
    // actions
    refresh, handleSave, handleDelete,
  };
}
