import { auth, onAuthStateChanged } from '@/scripts/firebase';
import {
  fetchCloudProgress,
  listenCloudProgress,
  saveCloudProgress,
  StarsMap
} from '@/services/game/caroCloud';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

const LOCAL_KEY = 'caro_stars_v1';

const mergeStars = (a: StarsMap, b: StarsMap): StarsMap => {
  const out: StarsMap = { ...a };
  for (const k of Object.keys(b)) {
    const lv = Number(k);
    out[lv] = Math.max(out[lv] ?? 0, b[lv] ?? 0) as 0|1|2|3;
  }
  return out;
};
const sumStars = (m: StarsMap) => Object.values(m).reduce<number>((s, v) => s + (v || 0), 0);

export function useCaroProgress() {
  const [starsByLevel, setStarsByLevel] = React.useState<StarsMap>({ 1: 0 });
  const [uid, setUid] = React.useState<string | null>(null);

  // Load local
  React.useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(LOCAL_KEY);
        if (raw) setStarsByLevel(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  // persist local khi state đổi (debounce nhẹ)
  React.useEffect(() => {
    const t = setTimeout(() => {
      AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(starsByLevel)).catch(()=>{});
    }, 50);
    return () => clearTimeout(t);
  }, [starsByLevel]);

  // Theo dõi đăng nhập
  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setUid(user?.uid ?? null));
    return unsub;
  }, []);

  // Đồng bộ 2 chiều khi có uid
  React.useEffect(() => {
    if (!uid) return;
    let unsubRemote: undefined | (() => void);

    (async () => {
      // 1) lấy local + cloud
      const raw = await AsyncStorage.getItem(LOCAL_KEY);
      const local: StarsMap = raw ? JSON.parse(raw) : { 1: 0 };
      const cloud = await fetchCloudProgress(uid);

      // 2) hợp nhất (giữ sao cao nhất cho từng level)
      const merged = mergeStars(local, cloud);
      setStarsByLevel(merged);
      await AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(merged));

      // 3) nếu cloud yếu hơn -> đẩy lên
      if (sumStars(merged) > sumStars(cloud)) {
        await saveCloudProgress(uid, merged);
      }

      // 4) nghe realtime – nếu chơi ở máy khác, đây sẽ cập nhật
      unsubRemote = listenCloudProgress(uid, async (remote) => {
        setStarsByLevel((prev) => {
          const next = mergeStars(prev, remote);
          AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(next)).catch(()=>{});
          return next;
        });
      });
    })();

    return () => { if (unsubRemote) unsubRemote(); };
  }, [uid]);

  const isUnlocked = React.useCallback((lv: number) => {
    if (lv === 1) return true;
    return (starsByLevel[lv - 1] ?? 0) >= 1;
  }, [starsByLevel]);

  const saveResult = React.useCallback((lv: number, stars: 0|1|2|3) => {
    setStarsByLevel(prev => {
      const best = Math.max(prev[lv] ?? 0, stars) as 0|1|2|3;
      const next: StarsMap = { ...prev, [lv]: best, [lv + 1]: prev[lv + 1] ?? 0 };
      // local
      AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(next)).catch(()=>{});
      // cloud
      if (uid) saveCloudProgress(uid, next).catch(()=>{});
      return next;
    });
  }, [uid]);

  return { starsByLevel, isUnlocked, saveResult, uid };
}
