import { auth, db } from '@/scripts/firebase';
import { percentFromLessons } from '@/utils/tab/progress';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useState } from 'react';

export type UserDoc = {
  displayName?: string;
  photoURL?: string;
  level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  stars?: number;
  streak?: number;
  hearts?: number;
  badges?: { id: string; icon?: string; name: string }[];
  premium?: boolean;
  premiumEnd?: string; // ISO date string
  progress?: {
    percent?: number; // 0..100
    lessonsDone?: number;
    lessonsTotal?: number;
  };
};

type Opts = { onError?: (e?: unknown) => void };

export function useUserProfile(opts?: Opts) {
  const [userData, setUserData] = useState<UserDoc | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Lắng nghe auth state + load doc
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          setUid(null);
          setUserData(null);
          return;
        }
        setUid(user.uid);
        const snap = await getDoc(doc(db, 'users', user.uid));
        setUserData(snap.exists() ? (snap.data() as UserDoc) : null);
      } catch (e) {
        console.warn(e);
        opts?.onError?.(e);
        setUserData(null);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    });
    return unsub;
  }, [opts]);

  const onRefresh = useCallback(async () => {
    if (!uid) return;
    try {
      setRefreshing(true);
      const snap = await getDoc(doc(db, 'users', uid));
      setUserData(snap.exists() ? (snap.data() as UserDoc) : null);
    } catch (e) {
      console.warn(e);
      opts?.onError?.(e);
    } finally {
      setRefreshing(false);
    }
  }, [uid, opts]);

  const progressPercent = useMemo(() => {
    const p = userData?.progress?.percent ?? percentFromLessons(userData?.progress);
    return Math.max(0, Math.min(100, Math.round(p || 0)));
  }, [userData]);

  // Avatar mặc định: Dicebear fun-emoji PNG (RN không render SVG từ URL)
  const defaultAvatar = useMemo(() => {
    if (!uid) return undefined;
    const seed = `monkey-${uid.slice(0, 6)}`;
    return `https://api.dicebear.com/7.x/fun-emoji/png?seed=${seed}&radius=50`;
  }, [uid]);

  return { uid, userData, loading, refreshing, onRefresh, progressPercent, defaultAvatar };
}
