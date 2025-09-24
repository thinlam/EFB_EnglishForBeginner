import type { StartKey } from '@/constants/onboarding/startModes';
import { useRouter } from 'expo-router';
import React from 'react';

export function useChooseStartMode() {
  const router = useRouter();
  const [selected, setSelected] = React.useState<StartKey | null>(null);

  const canContinue = !!selected;

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
