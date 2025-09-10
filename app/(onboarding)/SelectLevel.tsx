/**
 * SelectLevelScreen.tsx — Chỉ dùng Firestore để quyết định redirect
 * - Không auto-redirect theo AsyncStorage nữa (tránh dính user cũ)
 * - Lưu Firestore + (tuỳ chọn) lưu AsyncStorage sau khi chọn
 */

import { auth, db } from '@/scripts/firebase';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/* --- Map số sao → CEFR --- */
const STAR_TO_CEFR: Record<number, 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'> = {
  1: 'A1',
  2: 'A2',
  3: 'B1',
  4: 'B2',
  5: 'C1',
  // 6: 'C2', // bật nếu muốn thêm 6 sao
};

/* --- Dữ liệu hiển thị lựa chọn --- */
const levels = [
  { id: 1, stars: 1, label: 'Tôi mới học tiếng Anh' },
  { id: 2, stars: 2, label: 'Tôi biết vài từ thông dụng' },
  { id: 3, stars: 3, label: 'Tôi có thể giao tiếp cơ bản' },
  { id: 4, stars: 4, label: 'Tôi có thể nói và viết nhiều chủ đề' },
  { id: 5, stars: 5, label: 'Tôi có thể hiểu đa số chủ đề' },
  // { id: 6, stars: 6, label: 'Tôi gần như thành thạo (C2)' },
];

const levelMessages: Record<number, string> = {
  1: '✨ Cùng học từ căn bản để tạo nền tảng vững chắc!',
  2: '📚 Trình độ sơ khởi – bạn sẽ tiến bộ rất nhanh!',
  3: '💬 Giao tiếp cơ bản – bắt đầu thực hành ngay thôi!',
  4: '🧠 Bạn đã có nền – hãy đào sâu và hoàn thiện!',
  5: '🚀 Bạn gần như thành thạo – chỉ cần tinh chỉnh thêm thôi!',
  // 6: '🏆 C2 – duy trì phong độ và luyện kỹ năng nâng cao!',
};

export default function SelectLevelScreen() {
  const router = useRouter();
  const [selectedStars, setSelectedStars] = useState<number | null>(null);
  const [checking, setChecking] = useState(true);
  const fadeAnim = useState(new Animated.Value(0))[0];

  // 🔎 Chỉ kiểm tra Firestore. Nếu users/{uid}.levelCefr đã có → vào tabs.
  useEffect(() => {
    const checkFromFirestore = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setChecking(false);
          return;
        }
        const snap = await getDoc(doc(db, 'users', user.uid));
        const cefr = snap.exists() ? (snap.get('levelCefr') as string | undefined) : undefined;

        if (cefr) {
          router.replace('/(tabs)');
        } else {
          setChecking(false); // chưa có level → ở lại màn chọn
        }
      } catch {
        setChecking(false);
      }
    };
    checkFromFirestore();
  }, []);

  const handleSelect = (stars: number) => {
    setSelectedStars(stars);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const handleContinue = async () => {
    if (!selectedStars) return;
    const cefr = STAR_TO_CEFR[selectedStars]; // sao → CEFR

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Lỗi', 'Bạn chưa đăng nhập.');
        return;
      }

      await setDoc(
        doc(db, 'users', user.uid),
        {
          levelStars: selectedStars,
          levelCefr: cefr,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // (tuỳ chọn) Lưu local để HomeScreen đọc nhanh — không ảnh hưởng redirect lần đầu
      await AsyncStorage.setItem('efb.level', cefr);

      router.replace('/(onboarding)/ChooseStartModeScreen');
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể lưu trình độ.');
    }
  };

  const renderStars = (count: number) => (
    <View style={styles.starContainer}>
      {Array.from({ length: 5 }).map((_, i) => (
        <FontAwesome
          key={i}
          name="star"
          size={16}
          color={i < count ? '#FACC15' : '#E5E7EB'}
          style={{ marginRight: 3 }}
        />
      ))}
    </View>
  );

  // Trong lúc check Firestore, hiển thị skeleton rất nhẹ (tránh nhấp nháy)
  if (checking) {
    return (
      <SafeAreaView style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: '#6b7280' }}>Đang tải…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Trình độ tiếng Anh của bạn ở mức nào?</Text>

      <FlatList
        data={levels}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedStars === item.stars && styles.optionCardSelected,
            ]}
            onPress={() => handleSelect(item.stars)}
            activeOpacity={0.85}
          >
            {renderStars(item.stars)}
            <Text style={styles.optionLabel}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />

      {selectedStars !== null && (
        <Animated.View style={[styles.feedbackBox, { opacity: fadeAnim }]}>
          <Text style={styles.feedbackText}>{levelMessages[selectedStars]}</Text>

          <TouchableOpacity style={styles.button} onPress={handleContinue}>
            <Text style={styles.buttonText}>TIẾP TỤC</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.backButtonText}>← Trở về trang chính</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 40,
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
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  optionCardSelected: {
    backgroundColor: '#e0f2fe',
    borderColor: '#3b82f6',
  },
  optionLabel: {
    fontSize: 15,
    color: '#1f2937',
    marginTop: 8,
  },
  starContainer: {
    flexDirection: 'row',
  },
  feedbackBox: {
    marginTop: 20,
    alignItems: 'center',
  },
  feedbackText: {
    fontStyle: 'italic',
    fontSize: 14,
    color: '#2563eb',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    textTransform: 'uppercase',
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backButtonText: {
    color: '#1D4ED8',
    fontSize: 14,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});
