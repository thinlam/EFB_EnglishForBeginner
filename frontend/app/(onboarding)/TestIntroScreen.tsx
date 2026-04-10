import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

/* Styles */
// eslint-disable-next-line import/no-unresolved
import { styles } from '@/components/style/onboarding/TestIntroStyles';

/* Hook */
// eslint-disable-next-line import/no-unresolved
import { useTestIntro } from '@/hooks/onboarding/useTestIntro';

export default function TestIntroScreen() {
  const { handleStartTest, handleGoBack } = useTestIntro();

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
