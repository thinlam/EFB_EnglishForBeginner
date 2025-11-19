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

type AuthProfile = {
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
  return (
    docData?.photoURL ||
    docData?.avatarURL ||
    user?.photoURL ||
    null
  );
}

export function useAuthProfile(): AuthProfile {
  const [state, setState] = useState<AuthProfile>({
    greetingName: 'bạn',
    level: 'A1',
    cefrXp: 0,
    isPremium: false,
    photoURL: null,
  });

  useEffect(() => {
    const user = auth.currentUser;

    // nếu chưa đăng nhập thì giữ default
    if (!user) return;

    // 1. load cache từ AsyncStorage cho cảm giác “instant”
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const cached = JSON.parse(raw) as AuthProfile;
          setState((prev) => ({ ...prev, ...cached }));
        }
      } catch (err) {
        console.log('load auth profile cache error:', err);
      }
    })();

    // 2. subscribe Firestore realtime để cập nhật ngay sau khi mua Premium
    const ref = doc(db, 'users', user.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) return;

        const data = snap.data() as UserDoc;

        const next: AuthProfile = {
          greetingName: deriveGreetingName(data, user),
          level: deriveLevel(data),
          cefrXp: deriveCefrXp(data),
          isPremium: deriveIsPremium(data),
          photoURL: derivePhotoURL(data, user),
        };

        setState(next);

        // lưu cache lại
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      },
      (err) => {
        console.log('useAuthProfile listen error:', err);
      },
    );

    return () => {
      unsub();
    };
  }, []);

  return state;
}
