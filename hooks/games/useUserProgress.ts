import { useMemo } from 'react';

export function useUserProgress(gameKey: 'caro' | string) {
  // TODO: nối Firestore/AsyncStorage thật; đây là mock
  return useMemo(
    () => ({
      unlockedMax: 1, // chỉ mở Level 1
      starsByLevel: { 1: 0 }, // map level->sao
    }),
    []
  );
}
