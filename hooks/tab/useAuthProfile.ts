// hooks/tab/useAuthProfile.ts
import { auth, db } from '@/scripts/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export function useAuthProfile() {
  const [level, setLevel] = useState<string>('A1');
  const [greetingName, setGreetingName] = useState<string>('bạn');
  const [isPremium, setIsPremium] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const u = auth.currentUser;

      const pickName = (snap?: any, user?: any) => {
        const fromSnap =
          snap?.get?.('name') ||
          snap?.get?.('fullName') ||
          snap?.get?.('display_name') ||
          snap?.get?.('hoten') ||
          snap?.get?.('profile')?.name ||
          snap?.get?.('nickname') ||
          snap?.get?.('username');
        const fromAuth =
          user?.displayName || (user?.email ? String(user.email).split('@')[0] : '');
        return (fromSnap || fromAuth || '').toString().trim();
      };

      try {
        if (u) {
          const snap = await getDoc(doc(db, 'users', u.uid));

          // ===== LEVEL =====
          const cefrFromDb = snap.exists() ? snap.get('levelCefr') : undefined;
          if (typeof cefrFromDb === 'string' && cefrFromDb) {
            setLevel(cefrFromDb);
            await AsyncStorage.setItem('efb.level', cefrFromDb);
          } else {
            const localLevel = await AsyncStorage.getItem('efb.level');
            if (localLevel) setLevel(localLevel);
          }

          // ===== NAME =====
          const resolved = pickName(snap, u);
          if (resolved) {
            setGreetingName(resolved);
            await AsyncStorage.setItem('efb.name', resolved);
          } else {
            const localName = await AsyncStorage.getItem('efb.name');
            if (localName) setGreetingName(localName);
          }

          // ===== PREMIUM =====
          const premiumFromDb = snap.exists() ? snap.get('isPremium') : undefined;
          const premiumBool = !!premiumFromDb;
          setIsPremium(premiumBool);
          await AsyncStorage.setItem('efb.premium', premiumBool ? '1' : '0');
        } else {
          const localName = await AsyncStorage.getItem('efb.name');
          if (localName) setGreetingName(localName);

          const localLevel = await AsyncStorage.getItem('efb.level');
          if (localLevel) setLevel(localLevel);

          const localPremium = await AsyncStorage.getItem('efb.premium');
          if (localPremium) setIsPremium(localPremium === '1');
        }
      } catch {
        const localName = await AsyncStorage.getItem('efb.name');
        if (localName) setGreetingName(localName);

        const localLevel = await AsyncStorage.getItem('efb.level');
        if (localLevel) setLevel(localLevel);

        const localPremium = await AsyncStorage.getItem('efb.premium');
        if (localPremium) setIsPremium(localPremium === '1');
      }
    })();
  }, []);

  return { level, greetingName, isPremium };
}
