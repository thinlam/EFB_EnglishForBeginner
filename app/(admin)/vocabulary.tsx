import { styles } from '@/components/style/VocabularyStyles';
import { useVocabulary } from '@/hooks/admin/useVocabulary';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VocabularyScreen() {
  const router = useRouter();
  const {
    // lists & filters
    vocabList, loading, search, setSearch, uniqueTopics, selectedTopic, setSelectedTopic,
    // pagination
    currentPage, handlePrevPage, handleNextPage,
    // modal & form
    modalVisible, openAddModal, openEditModal, closeModal,
    word, setWord, meaning, setMeaning, topic, setTopic, lesson, setLesson,
    // suggest
    autoTranslate, toggleAutoTranslate, suggesting, suggestedMeaning, acceptSuggestion,
    // actions
    refresh, handleSave, handleDelete,
  } = useVocabulary();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>📚 Quản lý từ vựng</Text>

        {/* Search */}
        <TextInput
          style={styles.input}
          placeholder="🔍 Tìm từ vựng..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#888"
        />

        {/* Topic filter (simple text input; có thể đổi sang picker) */}
        <View style={styles.pickerContainer}>
          <TextInput
            style={styles.input}
            placeholder="Chọn chủ đề..."
            value={selectedTopic}
            onChangeText={setSelectedTopic}
            placeholderTextColor="#888"
          />
        </View>

        {/* Add */}
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>➕ Thêm từ vựng</Text>
        </TouchableOpacity>

        {/* List */}
        <FlatList
          data={vocabList}
          keyExtractor={(item: any) => item.id}
          refreshing={loading}
          onRefresh={refresh}
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

        {/* Back */}
        <TouchableOpacity onPress={() => router.push('/(admin)/home')} style={styles.backButton}>
          <Text style={styles.backButtonText}>⬅ Quay lại</Text>
        </TouchableOpacity>

        {/* Pagination */}
        <View style={styles.pagination}>
          <TouchableOpacity onPress={handlePrevPage} style={styles.pageButton}><Text>⬅</Text></TouchableOpacity>
          <Text>Trang {currentPage}</Text>
          <TouchableOpacity onPress={handleNextPage} style={styles.pageButton}><Text>➡</Text></TouchableOpacity>
        </View>

        {/* Modal thêm/sửa */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>📝 Từ vựng</Text>

              {/* Toggle auto-translate */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <TouchableOpacity
                  onPress={toggleAutoTranslate}
                  style={{
                    paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8,
                    backgroundColor: autoTranslate ? '#2e7d32' : '#555'
                  }}
                >
                  <Text style={{ color: '#fff' }}>{autoTranslate ? 'Auto-dịch: BẬT' : 'Auto-dịch: TẮT'}</Text>
                </TouchableOpacity>
                {suggesting ? <View style={{ marginLeft: 10 }}><ActivityIndicator /></View> : null}
              </View>

              <TextInput
                placeholder="Từ vựng (EN)"
                value={word}
                onChangeText={setWord}
                style={styles.input}
                placeholderTextColor="#888"
                autoCapitalize="none"
              />

              <TextInput
                placeholder="Nghĩa tiếng Việt"
                value={meaning}
                onChangeText={setMeaning}
                style={styles.input}
                placeholderTextColor="#888"
              />

              {autoTranslate && !meaning.trim() && suggestedMeaning ? (
                <TouchableOpacity
                  onPress={acceptSuggestion}
                  style={{
                    alignSelf: 'flex-start', backgroundColor: '#e8f5e9', borderRadius: 8,
                    paddingVertical: 6, paddingHorizontal: 10, marginBottom: 8, borderWidth: 1, borderColor: '#c8e6c9'
                  }}
                >
                  <Text style={{ color: '#1b5e20' }}>Gợi ý: {suggestedMeaning} (bấm để dán)</Text>
                </TouchableOpacity>
              ) : null}

              <TextInput
                placeholder="Chủ đề (VD: Food)"
                value={topic}
                onChangeText={setTopic}
                style={styles.input}
                placeholderTextColor="#888"
              />
              <TextInput
                placeholder="Bài học (VD: Lesson 1)"
                value={lesson}
                onChangeText={setLesson}
                style={styles.input}
                placeholderTextColor="#888"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.addButton, { backgroundColor: 'green' }]} onPress={handleSave}>
                  <Text style={styles.addButtonText}>Lưu</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.addButton, { backgroundColor: 'gray' }]} onPress={closeModal}>
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
