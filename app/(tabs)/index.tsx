/**
 * Dự án: EFB - English For Beginners
 * \* Mục đích: Xây dựng ứng dụng học tiếng Anh cơ bản.
 * người dùng: Người mới bắt đầu học tiếng Anh.
 * Chức năng: Đăng nhập, đăng ký, học từ vựng, ngữ pháp, luyện nghe nói.
 * Công nghệ: React Native, Expo, Firebase.
 * \* Tác giả: [NHÓM EFB]
 * Ngày tạo: 01/06/2025
 */

import ChatbotButton from '@/components/ChatbotButton';
import HeaderInfo from '@/components/HeaderInfo';
import LessonButton from '@/components/LessonButton';
import LevelProgress from '@/components/LevelProgress';
import { styles } from '@/components/style/IndexStyles';
import { ScrollView, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <ScrollView>
        <HeaderInfo />
        <LevelProgress />

        <LessonButton title="Lesson 01" icon="pencil" />
        <LessonButton title="Play Game" icon="game-controller" />
        <LessonButton title="Từ điển" icon="book" />
      </ScrollView>

      <ChatbotButton />
    </View>
  );
}
          