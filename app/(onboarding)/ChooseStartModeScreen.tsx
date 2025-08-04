import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChooseStartModeScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const options = [
    {
      key: 'basic',
      title: 'Bắt đầu từ cơ bản',
      desc: 'Học những chủ đề nền tảng trong khóa học Tiếng Anh',
      icon: require('@/assets/images/book.png'), // Thêm icon vào thư mục assets/icons
    },
    {
      key: 'test',
      title: 'Xác định trình độ hiện tại',
      desc: 'Làm bài test 4 kỹ năng để xác định lộ trình phù hợp nhất',
      icon: require('@/assets/images/compass.png'),
    },
  ];

  const handleContinue = () => {
    if (!selected) return;

    if (selected === 'basic') {
      router.replace({ pathname: '/(tabs)', params: { lessonId: 1 } });
    } else {
      router.replace('/(onboarding)/TestIntroScreen'); // chuyển đến bài test
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>
          Giờ mình cùng tìm điểm khởi hành phù hợp nhé!
        </Text>

        {options.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.optionCard,
              selected === opt.key && styles.optionCardSelected,
            ]}
            onPress={() => setSelected(opt.key)}
            activeOpacity={0.85}
          >
            <View style={styles.row}>
              <Image
                source={opt.icon}
                style={styles.icon}
                resizeMode="contain"
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>{opt.title}</Text>
                <Text style={styles.optionDesc}>{opt.desc}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        disabled={!selected}
        onPress={handleContinue}
        style={[
          styles.continueButton,
          { backgroundColor: selected ? '#2563eb' : '#d1d5db' },
        ]}
      >
        <Text style={styles.continueText}>TIẾP TỤC</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 36,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  optionCardSelected: {
    backgroundColor: '#e0f2fe',
    borderColor: '#3b82f6',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 36,
    height: 36,
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  optionDesc: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  continueButton: {
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 12,
    marginBottom: 20,
  },
  continueText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
