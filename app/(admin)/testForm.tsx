import { db } from '@/scripts/firebase';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function TestFormScreen() {
  const router = useRouter();
  const [type, setType] = useState('vocabulary');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [answer, setAnswer] = useState('');
  const [addedCount, setAddedCount] = useState(0);

  const handleSubmit = async () => {
    if (!question || options.some(opt => !opt) || !answer) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin.');
      return;
    }

    if (!options.includes(answer)) {
      Alert.alert('Lỗi', 'Đáp án phải trùng với 1 trong 4 lựa chọn.');
      return;
    }

    try {
      await addDoc(collection(db, 'testQuestions'), {
        type,
        question,
        options,
        correctAnswer: answer,
        createdAt: new Date(),
      });

      setQuestion('');
      setOptions(['', '', '', '']);
      setAnswer('');
      setAddedCount(prev => prev + 1);
      Alert.alert('✅ Thành công', 'Đã thêm câu hỏi.');
    } catch (error) {
      Alert.alert('❌ Lỗi', 'Không thể thêm câu hỏi.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Thêm câu hỏi kiểm tra</Text>

          <Text style={styles.label}>Loại câu hỏi</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={type}
              onValueChange={setType}
              style={styles.picker}
            >
              <Picker.Item label="🧠 Vocabulary" value="vocabulary" />
              <Picker.Item label="📝 Grammar" value="grammar" />
              <Picker.Item label="📖 Reading" value="reading" />
            </Picker>
          </View>

          <Text style={styles.label}>Câu hỏi</Text>
          <TextInput
            value={question}
            onChangeText={setQuestion}
            style={styles.input}
            placeholder="Nhập câu hỏi..."
            multiline
          />

          <Text style={styles.label}>Tuỳ chọn (4 lựa chọn)</Text>
          {options.map((opt, index) => (
            <TextInput
              key={index}
              value={opt}
              onChangeText={text => {
                const newOptions = [...options];
                newOptions[index] = text;
                setOptions(newOptions);
              }}
              style={styles.input}
              placeholder={`Lựa chọn ${index + 1}`}
            />
          ))}

          <Text style={styles.label}>Đáp án đúng</Text>
          <TextInput
            value={answer}
            onChangeText={setAnswer}
            style={styles.input}
            placeholder="Nhập đáp án đúng (trùng 1 trong 4 lựa chọn)"
          />

          <TouchableOpacity onPress={handleSubmit} style={styles.button}>
            <Text style={styles.buttonText}>+ Thêm câu hỏi</Text>
          </TouchableOpacity>

          <Text style={styles.success}>
            ✅ Đã thêm {addedCount} câu hỏi trong phiên này
          </Text>

          <TouchableOpacity onPress={() => router.replace('/(admin)/testList')}>
            <Text style={styles.link}>🏁 Kết thúc thêm câu hỏi</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 80,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginTop: 6,
    marginBottom: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 120,
    backgroundColor: '#f9fafb',
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 12,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  success: {
    marginTop: 16,
    color: 'green',
    fontSize: 14,
  },
  link: {
    marginTop: 8,
    color: '#2563eb',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
});
