import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

/* Firebase */
import { auth, db } from '@/scripts/firebase';
import { deleteField, doc, updateDoc } from 'firebase/firestore';

export function useTestIntro() {
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

  return { handleStartTest, handleGoBack };
}
