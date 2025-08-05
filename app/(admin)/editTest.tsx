// app/(admin)/editTest.tsx
import { db } from '@/scripts/firebase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity
} from 'react-native';

export default function EditTestScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [type, setType] = useState('vocabulary');

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, 'testQuestions', id as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setQuestion(data.question);
        setOptions(data.options);
        setCorrectAnswer(data.correctAnswer);
        setType(data.type || 'vocabulary');
      }
    };
    if (id) fetchData();
  }, [id]);

  const handleUpdate = async () => {
    if (!question || options.some(opt => !opt) || !correctAnswer) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin.');
      return;
    }
    if (!options.includes(correctAnswer)) {
      Alert.alert('Lỗi', 'Đáp án phải trùng với 1 trong 4 lựa chọn.');
      return;
    }
    try {
      await updateDoc(doc(db, 'testQuestions', id as string), {
        question,
        options,
        correctAnswer,
        type,
      });
      Alert.alert('✅ Thành công', 'Đã cập nhật câu hỏi.');
      router.replace('/(admin)/testList');
    } catch (error) {
      Alert.alert('❌ Lỗi', 'Không thể cập nhật.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Chỉnh sửa câu hỏi</Text>
      <Text style={styles.label}>Loại câu hỏi: {type}</Text>
      <Text style={styles.label}>Câu hỏi</Text>
      <TextInput
        value={question}
        onChangeText={setQuestion}
        style={styles.input}
        multiline
      />
      <Text style={styles.label}>Tuỳ chọn</Text>
      {options.map((opt, i) => (
        <TextInput
          key={i}
          value={opt}
          onChangeText={text => {
            const newOptions = [...options];
            newOptions[i] = text;
            setOptions(newOptions);
          }}
          style={styles.input}
          placeholder={`Lựa chọn ${i + 1}`}
        />
      ))}
      <Text style={styles.label}>Đáp án đúng</Text>
      <TextInput
        value={correctAnswer}
        onChangeText={setCorrectAnswer}
        style={styles.input}
        placeholder="Đáp án đúng (trùng 1 trong 4 lựa chọn)"
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>💾 Lưu chỉnh sửa</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 100,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2563eb',
  },
  label: {
    marginTop: 10,
    fontWeight: '600',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },
  button: {
    backgroundColor: '#10b981',
    padding: 14,
    borderRadius: 12,
    marginTop: 20,
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
