import { db } from '@/scripts/firebase';
import { useRouter } from 'expo-router';
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function TestListScreen() {
  const [questions, setQuestions] = useState<any[]>([]);
  const router = useRouter();

  const fetchQuestions = async () => {
    const snapshot = await getDocs(collection(db, 'testQuestions'));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setQuestions(data);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Xác nhận xoá',
      'Bạn có chắc muốn xoá câu hỏi này?',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: async () => {
            await deleteDoc(doc(db, 'testQuestions', id));
            fetchQuestions(); // refresh danh sách
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderItem = ({ item, index }: any) => (
    <View style={styles.card}>
      <Text style={styles.index}>
        Câu {index + 1}: <Text style={styles.type}>[{item.type}]</Text>
      </Text>
      <Text style={styles.question}>{item.question}</Text>
      <View style={styles.options}>
        {item.options.map((opt: string, idx: number) => (
          <Text key={idx}>• {opt}</Text>
        ))}
      </View>
      <Text style={styles.answer}>✅ Đáp án đúng: {item.correctAnswer}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#f59e0b' }]}
          onPress={() =>
            router.push({
              pathname: '/(admin)/editTest',
              params: { id: item.id }, // Truyền id qua route
            })
          }
        >
          <Text style={styles.actionText}> Sửa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#ef4444' }]}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.actionText}> Xoá</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>📋 Danh sách câu hỏi kiểm tra</Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(admin)/testForm')}
        >
          <Text style={styles.addButtonText}>➕ Thêm câu hỏi mới</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/(admin)/home')}>
          <Text style={styles.link}>🏁 Trở về trang chủ</Text>
        </TouchableOpacity>

        <FlatList
          data={questions}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2563eb',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  index: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  type: {
    fontStyle: 'italic',
    color: '#4b5563',
  },
  question: {
    fontSize: 16,
    marginBottom: 6,
  },
  options: {
    marginBottom: 4,
  },
  answer: {
    fontWeight: 'bold',
    color: '#10b981',
  },
  link: {
    marginTop: 8,
    color: '#2563eb',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
  },
});
