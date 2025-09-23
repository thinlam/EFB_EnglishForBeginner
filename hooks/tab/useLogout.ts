import { auth } from '@/scripts/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from 'firebase/auth';
import { useCallback } from 'react';

type Opts = {
  onDone?: () => void;
  onError?: (e?: unknown) => void;
};

export function useLogout(opts?: Opts) {
  const handleLogout = useCallback(async () => {
    try {
      // gom các key hay dùng vào 1 nơi để bảo trì
      const KEYS = ['user', 'efb.level', 'efb.hearts', 'efb.premium'];
      await AsyncStorage.multiRemove(KEYS);
      await signOut(auth);
      opts?.onDone?.();
    } catch (e) {
      console.log('Logout error:', e);
      opts?.onError?.(e);
    }
  }, [opts]);

  return { handleLogout };
}
