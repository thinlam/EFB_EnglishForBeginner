import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, View } from 'react-native';

/* Firebase */
import { auth, db } from '@/scripts/firebase';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
/* Constants */
import { STAR_TO_CEFR, levelMessages } from '@/constants/onboarding/levels';
/** cho phép bật/tắt lưu AsyncStorage sau khi chọn (mặc định true) */
const SAVE_LOCAL_AFTER_SELECT = true;

export function useSelectLevel() {
  const router = useRouter();
  const [selectedStars, setSelectedStars] = useState<number | null>(null);
  const [checking, setChecking] = useState(true);

  // animation fade for feedback
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const feedbackOpacityStyle = useMemo(
    () => ({ opacity: fadeAnim } as const),
    [fadeAnim]
  );

  // 🔎 chỉ check Firestore để quyết định redirect
  useEffect(() => {
    (async () => {
      try {
        const user = auth.currentUser;
        if (!user) { setChecking(false); return; }
        const snap = await getDoc(doc(db, 'users', user.uid));
        const cefr = snap.exists() ? (snap.get('levelCefr') as string | undefined) : undefined;
        if (cefr) router.replace('/(tabs)');
        else setChecking(false);
      } catch {
        setChecking(false);
      }
    })();
  }, [router]);

  const handleSelect = (stars: number) => {
    setSelectedStars(stars);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  };

  const handleContinue = async () => {
    if (!selectedStars) return;
    const cefr = STAR_TO_CEFR[selectedStars];

    try {
      const user = auth.currentUser;
      if (!user) { Alert.alert('Lỗi', 'Bạn chưa đăng nhập.'); return; }

      await setDoc(
        doc(db, 'users', user.uid),
        { levelStars: selectedStars, levelCefr: cefr, updatedAt: serverTimestamp() },
        { merge: true }
      );

      if (SAVE_LOCAL_AFTER_SELECT) {
        await AsyncStorage.setItem('efb.level', cefr);
      }

      router.replace('/(onboarding)/ChooseStartModeScreen');
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể lưu trình độ.');
    }
  };

  const handleBackHome = () => router.replace('/(tabs)');
const renderStars = (count: number, Icon: React.ComponentType<any>) =>
  React.createElement(Animated.View, null,
    React.createElement(IconRow, { count, Icon })
  );

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
function IconRow({ count, Icon }: { count: number; Icon: React.ComponentType<any> }) {
  return React.createElement(
    View,
    { style: { flexDirection: 'row' } },
    ...Array.from({ length: 5 }).map((_, i) =>
      React.createElement(Icon, {
        key: i,
        name: 'star',
        size: 16,
        color: i < count ? '#FACC15' : '#E5E7EB',
        style: { marginRight: 3 },
      })
    )
  );
}
