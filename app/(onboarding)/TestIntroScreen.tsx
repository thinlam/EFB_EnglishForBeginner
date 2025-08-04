import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { auth, db } from '@/scripts/firebase';
import { deleteField, doc, updateDoc } from 'firebase/firestore';

export default function TestIntroScreen() {
  const router = useRouter();

  const handleStartTest = () => {
    router.replace('/(onboarding)/Test'); // chuyển đến bài kiểm tra thật
  };

  const handleGoBack = async () => {
    try {
      const user = auth.currentUser;

      // Nếu đã đăng nhập, xoá trên Firebase
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          level: deleteField(),
          lesson: deleteField(), // nếu có lesson
        });
      }

      // Xoá local cho cả user đăng nhập và không đăng nhập
      await AsyncStorage.multiRemove(['user_level', 'user_lesson']);

      router.replace('/(onboarding)/SelectLevel');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể xoá dữ liệu trình độ.');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/test_intro.png')}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.title}>🧠 Bài kiểm tra trình độ</Text>
      <Text style={styles.description}>
        {`• Tổng cộng: 20 câu hỏi\n• Bao gồm: Từ vựng – Ngữ pháp – Đọc hiểu\n• Mục tiêu: Xác định trình độ học phù hợp với bạn nhất`}
      </Text>

      <Text style={styles.note}>
        ⏱ Hãy chuẩn bị tinh thần trước khi bắt đầu. Bạn sẽ không thể quay lại giữa chừng.
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleStartTest}>
        <Text style={styles.buttonText}>Bắt đầu kiểm tra</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <Text style={styles.backButtonText}>← Quay lại chọn trình độ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  image: {
    width: '80%',
    height: 180,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D4ED8',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  note: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#1D4ED8',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backButtonText: {
    color: '#1D4ED8',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
