// hooks/tab/useAuthProfile.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { auth, db } from '@/scripts/firebase';

const STORAGE_KEY = '@efb_auth_profile';

type UserDoc = {
  name?: string;
  fullName?: string;
  display_name?: string;
  hoten?: string;
  profile?: { name?: string };
  nickname?: string;
  username?: string;

  level?: string;
  cefrLevel?: string;
  cefrXp?: number;

  isPremium?: boolean;
  premium?: boolean;
  premiumPlanId?: string;
  premiumExpiresAt?: any;

  photoURL?: string | null;
  avatarURL?: string | null;
};

export type AuthProfile = {
  greetingName: string;
  level: string;
  cefrXp: number;
  isPremium: boolean;
  photoURL: string | null;
};

export type UseAuthProfileReturn = {
  loading: boolean;
  user: any | null;          // Firebase user
  profile: AuthProfile | null;

  // để UI xài cho tiện (HomeScreen, v.v.)
  greetingName: string;
  level: string;
  cefrXp: number;
  isPremium: boolean;
  photoURL: string | null;
};

function deriveGreetingName(docData: UserDoc, user: any): string {
  const fromDoc =
    docData?.name ||
    docData?.fullName ||
    docData?.display_name ||
    docData?.hoten ||
    docData?.profile?.name ||
    docData?.nickname ||
    docData?.username;

  const fromAuth = user?.displayName;

  const raw = (fromDoc || fromAuth || '').trim();
  return raw || 'bạn';
}

function deriveLevel(docData: UserDoc): string {
  return docData?.level || docData?.cefrLevel || 'A1';
}

function deriveCefrXp(docData: UserDoc): number {
  const xp = (docData as any)?.cefrXp;
  return typeof xp === 'number' && Number.isFinite(xp) ? xp : 0;
}

function deriveIsPremium(docData: UserDoc): boolean {
  const { isPremium, premium, premiumPlanId, premiumExpiresAt } = docData;

  let hasFutureExpire = false;
  if (premiumExpiresAt) {
    let d: Date | null = null;
    if (typeof premiumExpiresAt?.toDate === 'function') {
      d = premiumExpiresAt.toDate();
    } else if (premiumExpiresAt instanceof Date) {
      d = premiumExpiresAt;
    } else if (
      typeof premiumExpiresAt === 'string' ||
      typeof premiumExpiresAt === 'number'
    ) {
      d = new Date(premiumExpiresAt);
    }
    if (d && !Number.isNaN(d.getTime())) {
      hasFutureExpire = d.getTime() > Date.now();
    }
  }

  return !!(
    (typeof isPremium === 'boolean' && isPremium) ||
    (typeof premium === 'boolean' && premium) ||
    premiumPlanId ||
    hasFutureExpire
  );
}

function derivePhotoURL(docData: UserDoc, user: any): string | null {
  return docData?.photoURL || docData?.avatarURL || user?.photoURL || null;
}

export function useAuthProfile(): UseAuthProfileReturn {
  const [state, setState] = useState<UseAuthProfileReturn>({
    loading: true,
    user: null,
    profile: null,
    greetingName: 'bạn',
    level: 'A1',
    cefrXp: 0,
    isPremium: false,
    photoURL: null,
  });

  useEffect(() => {
    const user = auth.currentUser;

    // ❌ chưa login
    if (!user) {
      setState((prev) => ({
        ...prev,
        loading: false,
        user: null,
        profile: null,
        greetingName: 'bạn',
        level: 'A1',
        cefrXp: 0,
        isPremium: false,
        photoURL: null,
      }));
      return;
    }

    // 1. Load cache để hiển thị nhanh
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const cached = JSON.parse(raw) as AuthProfile;
          setState((prev) => ({
            ...prev,
            loading: false,
            user,
            profile: cached,
            greetingName: cached.greetingName,
            level: cached.level,
            cefrXp: cached.cefrXp,
            isPremium: cached.isPremium,
            photoURL: cached.photoURL,
          }));
        } else {
          setState((prev) => ({ ...prev, loading: true, user }));
        }
      } catch (err) {
        console.log('load auth profile cache error:', err);
        setState((prev) => ({ ...prev, loading: true, user }));
      }
    })();

    // 2. Subscribe Firestore realtime
    const ref = doc(db, 'users', user.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setState((prev) => ({
            ...prev,
            loading: false,
            user,
            profile: null,
          }));
          return;
        }

        const data = snap.data() as UserDoc;

        const nextProfile: AuthProfile = {
          greetingName: deriveGreetingName(data, user),
          level: deriveLevel(data),
          cefrXp: deriveCefrXp(data),
          isPremium: deriveIsPremium(data),
          photoURL: derivePhotoURL(data, user),
        };

        setState({
          loading: false,
          user,
          profile: nextProfile,
          greetingName: nextProfile.greetingName,
          level: nextProfile.level,
          cefrXp: nextProfile.cefrXp,
          isPremium: nextProfile.isPremium,
          photoURL: nextProfile.photoURL,
        });

        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextProfile)).catch(
          () => {},
        );
      },
      (err) => {
        console.log('useAuthProfile listen error:', err);
        setState((prev) => ({ ...prev, loading: false }));
      },
    );

    return () => {
      unsub();
    };
  }, []);

  return state;
}
