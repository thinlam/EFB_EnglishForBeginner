import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { styles } from '@/components/style/admin/TestFormStyles';
import { useTestForm } from '@/hooks/admin/useTestForm';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function TestFormScreen() {
  const router = useRouter();
  const {
    type, setType,
    question, setQuestion,
    options, setOptionAt,
    answer, setAnswer,
    addedCount,
    handleSubmit,
  } = useTestForm();

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Thêm câu hỏi kiểm tra</Text>

          <Text style={styles.label}>Loại câu hỏi</Text>
          <View style={styles.pickerWrapper}>
            <Picker selectedValue={type} onValueChange={setType} style={styles.picker}>
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
              onChangeText={(t) => setOptionAt(index, t)}
              style={styles.input}
              placeholder={`Lựa chọn ${index + 1}`}
              autoCapitalize="none"
            />
          ))}

          <Text style={styles.label}>Đáp án đúng</Text>
          <TextInput
            value={answer}
            onChangeText={setAnswer}
            style={styles.input}
            placeholder="Nhập đáp án đúng (trùng 1 trong 4 lựa chọn)"
            autoCapitalize="none"
          />

          <TouchableOpacity onPress={handleSubmit} style={styles.button}>
            <Text style={styles.buttonText}>+ Thêm câu hỏi</Text>
          </TouchableOpacity>

          <Text style={styles.success}>✅ Đã thêm {addedCount} câu hỏi trong phiên này</Text>

          {/* <TouchableOpacity onPress={() => router.replace('/(admin)/test-list')}>
            <Text style={styles.link}>🏁 Kết thúc thêm câu hỏi</Text>
          </TouchableOpacity> */}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
