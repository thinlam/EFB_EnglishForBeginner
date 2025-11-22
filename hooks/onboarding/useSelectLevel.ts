import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, View } from 'react-native';

/* Firebase */
import { auth, db } from '@/scripts/firebase';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

/* Constants */
import { STAR_TO_CEFR, levelMessages } from '@/constants/onboarding/levels';

/** cho phép bật/tắt lưu AsyncStorage sau khi chọn (mặc định true) */
const SAVE_LOCAL_AFTER_SELECT = true;

type IconComponentType = React.ComponentType<{
  name: string;
  size?: number;
  color?: string;
  style?: any;
}>;

export function useSelectLevel() {
  const router = useRouter();
  const [selectedStars, setSelectedStars] = useState<number | null>(null);
  const [checking, setChecking] = useState(true);

  // 🔎 chỉ check Firestore để quyết định redirect
  useEffect(() => {
    (async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setChecking(false);
          return;
        }

        const snap = await getDoc(doc(db, 'users', user.uid));
        const cefr = snap.exists()
          ? (snap.get('levelCefr') as string | undefined)
          : undefined;

        if (cefr) {
          router.replace('/(tabs)');
        } else {
          setChecking(false);
        }
      } catch {
        setChecking(false);
      }
    })();
  }, [router]);

  // opacity thường, không Animated
  const feedbackOpacityStyle = useMemo(
    () =>
      ({
        opacity: selectedStars !== null ? 1 : 0,
      }) as const,
    [selectedStars],
  );

  const handleSelect = (stars: number) => {
    setSelectedStars(stars);
  };

  const handleContinue = async () => {
    if (!selectedStars) return;
    const cefr = STAR_TO_CEFR[selectedStars];

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
        { merge: true },
      );

      if (SAVE_LOCAL_AFTER_SELECT) {
        await AsyncStorage.setItem('efb.level', cefr);
      }

      router.replace('/(onboarding)/ChooseStartModeScreen');
    } catch {
      Alert.alert('Lỗi', 'Không thể lưu trình độ.');
    }
  };

  const handleBackHome = () => router.replace('/(tabs)');

  /** Render dãy sao – dùng createElement, không JSX */
  const renderStars = (count: number, Icon: IconComponentType) =>
    React.createElement(IconRow, { count, Icon });

  const feedbackTextFor = (stars: number) => levelMessages[stars] ?? '';

  return {
    checking,
    selectedStars,
    feedbackOpacityStyle,
    handleSelect,
    handleContinue,
    handleBackHome,
    renderStars,
    feedbackTextFor,
  };
}

/* small presentational helper (không phụ thuộc RN Styles của screen) */
function IconRow({
  count,
  Icon,
}: {
  count: number;
  Icon: IconComponentType;
}) {
  return React.createElement(
    View,
    { style: { flexDirection: 'row' } },
    ...Array.from({ length: 5 }).map((_, i) => {
      const filled = i < count;
      return React.createElement(Icon, {
        key: i,
        name: filled ? 'star' : 'star-o',
        size: 16,
        color: filled ? '#FACC15' : '#E5E7EB',
        style: { marginRight: 3 },
      });
    }),
  );
}
