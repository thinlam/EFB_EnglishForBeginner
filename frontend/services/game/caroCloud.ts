import { db } from '@/scripts/firebase'; // file init firebase của bạn
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';

export type StarsMap = Record<number, 0|1|2|3>;
const path = (uid: string) => doc(db, 'users', uid, 'games', 'caro');

export async function fetchCloudProgress(uid: string): Promise<{starsByLevel: StarsMap; updatedAt: number}> {
  const snap = await getDoc(path(uid));
  if (!snap.exists()) return { starsByLevel: { 1: 0 }, updatedAt: 0 };
  const data = snap.data() as any;
  return {
    starsByLevel: (data.starsByLevel ?? {}) as StarsMap,
    updatedAt: (data.updatedAt?.toMillis?.() ?? 0) as number,
  };
}

export async function saveCloudProgress(uid: string, starsByLevel: StarsMap) {
  await setDoc(path(uid), { starsByLevel, updatedAt: serverTimestamp() }, { merge: true });
}

export function listenCloudProgress(uid: string, cb: (stars: StarsMap) => void) {
  return onSnapshot(path(uid), (snap) => {
    if (!snap.exists()) return;
    const data = snap.data() as any;
    cb((data.starsByLevel ?? {}) as StarsMap);
  });
}
