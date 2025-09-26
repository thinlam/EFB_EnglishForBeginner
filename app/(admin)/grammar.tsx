// GrammarScreen.tsx

import { styles } from '@/components/style/GrammarStyles';
import { db } from '@/scripts/firebase';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Keyboard, Modal, Platform, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GrammarScreen() {
  type GrammarItem = {
    id: string;
    title: string;
    description: string;
    level: string;
  };

  const [grammarList, setGrammarList] = useState<GrammarItem[]>([]);
  const [filteredList, setFilteredList] = useState<GrammarItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<GrammarItem | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState('A1');
  const [filterLevel, setFilterLevel] = useState('');
  const [searchText, setSearchText] = useState('');
  const router = useRouter();

  const grammarRef = collection(db, 'grammar_rules');

  const fetchGrammar = async () => {
    const snapshot = await getDocs(grammarRef);
    const data = snapshot.docs.map((doc) => {
      const docData = doc.data();
      return {
        id: doc.id,
        title: docData.title ?? '',
        description: docData.description ?? '',
        level: docData.level ?? '',
      };
    });
    setGrammarList(data);
  };

  useEffect(() => {
    fetchGrammar();
  }, []);

  useEffect(() => {
    filterGrammar();
  }, [grammarList, searchText, filterLevel]);

  const filterGrammar = () => {
    const filtered = grammarList.filter((item) => {
      const matchText = item.title.toLowerCase().includes(searchText.toLowerCase());
      const matchLevel = filterLevel ? item.level === filterLevel : true;
      return matchText && matchLevel;
    });
    setFilteredList(filtered);
  };

  const handleSave = async () => {
    if (!title.trim()) return Alert.alert('Thiếu tiêu đề');

    if (editingItem) {
      await updateDoc(doc(db, 'grammar_rules', editingItem.id), {
        title,
        description,
        level,
      });
    } else {
      await addDoc(grammarRef, { title, description, level });
    }

    setModalVisible(false);
    setEditingItem(null);
    setTitle('');
    setDescription('');
    setLevel('A1');
    fetchGrammar();
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'grammar_rules', id));
    fetchGrammar();
  };

  const handleEdit = (item: React.SetStateAction<{ id: string; title: string; description: string; level: string; } | null>) => {
    setEditingItem(item);
    setTitle(title);
    setDescription(description);
    setLevel(level);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Quản lý Ngữ pháp</Text>

      <View style={styles.filterRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Tìm theo tiêu đề..."
          value={searchText}
          onChangeText={setSearchText}
        />
       <View style={styles.filterPicker}>
          <Picker
            selectedValue={filterLevel}
            onValueChange={(value) => setFilterLevel(value)}
            style={Platform.OS === 'ios' ? {} : { height: 42 }}
          >
            <Picker.Item label="All" value="" />
            <Picker.Item label="A1" value="A1" />
            <Picker.Item label="A2" value="A2" />
            <Picker.Item label="B1" value="B1" />
            <Picker.Item label="B2" value="B2" />
            <Picker.Item label="C1" value="C1" />
          </Picker>
        </View>
      </View>

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Thêm mới</Text>
      </TouchableOpacity>

      <FlatList 
        data={filteredList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>
              {item.title} <Text style={styles.level}>({item.level})</Text>
            </Text>
            <Text style={styles.itemDesc}>{item.description}</Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
                <Text style={styles.buttonText}>Sửa</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                <Text style={styles.buttonText}>Xoá</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

     <TouchableOpacity
               style={[styles.button, { backgroundColor: '#cccc', marginTop: 20, alignSelf: 'center' }]}
               onPress={() => router.push('/(admin)/home')}
             >
               <Text style={styles.buttonText}>⬅ quay lại </Text>
             </TouchableOpacity>

      {/* Modal Thêm/Sửa */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {editingItem ? 'Sửa ngữ pháp' : 'Thêm ngữ pháp'}
              </Text>

              <TextInput
                placeholder="Tiêu đề"
                value={title}
                onChangeText={setTitle}
                style={styles.input}
              />
              <TextInput
                placeholder="Mô tả"
                value={description}
                onChangeText={setDescription}
                multiline
                style={[styles.input, { height: 200, textAlignVertical: 'top' }]}
              />
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={level}
                  onValueChange={setLevel}
                  style={Platform.OS === 'ios' ? { height: 200 } : { height: 42 }}
                >
                  <Picker.Item label="A1" value="A1" />
                  <Picker.Item label="A2" value="A2" />
                  <Picker.Item label="B1" value="B1" />
                  <Picker.Item label="B2" value="B2" />
                  <Picker.Item label="C1" value="C1" />
                </Picker>
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Lưu</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={{ textAlign: 'center', marginTop: 10 }}>Huỷ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

