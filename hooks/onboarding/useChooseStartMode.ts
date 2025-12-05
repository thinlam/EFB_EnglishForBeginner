import type { StartKey } from '@/constants/onboarding/startModes';
import { START_OPTIONS } from '@/constants/onboarding/startModes';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert } from 'react-native';

export function useChooseStartMode() {
  const router = useRouter();
  const [selected, _setSelected] = React.useState<StartKey | null>(null);

  const setSelected = (key: StartKey) => {
    const opt = START_OPTIONS.find(o => o.key === key);
    if (opt?.locked) {
      Alert.alert("Coming Soon", "Tính năng này đang phát triển.");
      return;                // ❌ KHÔNG CHO GHI VÀO STATE
    }
    _setSelected(key);        // ✅ Chỉ set khi không locked
  };

  const canContinue =
    selected !== null &&
    !START_OPTIONS.find(o => o.key === selected)?.locked;

  const handleContinue = React.useCallback(() => {
    if (!selected) return;

    if (selected === 'basic') {
      router.replace({ pathname: '/(tabs)', params: { lessonId: 1 } });
    } else {
      router.replace('/(onboarding)/TestIntroScreen');
    }
  }, [router, selected]);

  return { selected, setSelected, canContinue, handleContinue };
}
