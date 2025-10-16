import { auth, db } from '@/scripts/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    doc, getDoc,
    serverTimestamp,
    setDoc, updateDoc
} from 'firebase/firestore';

type StarsMap = Record<number, 0|1|2|3>;
const AS_KEY = 'caro_stars_v1'; // local mirror

// Đường dẫn Firestore: users/{uid}/games/caro (document)
function caroDoc(uid: string) {
  return doc(db, 'users', uid, 'games', 'caro');
}

export async function localGet(): Promise<StarsMap> {
  try {
    const raw = await AsyncStorage.getItem(AS_KEY);
    return raw ? JSON.parse(raw) : { 1: 0 };
  } catch { return { 1: 0 }; }
}

export async function localSet(map: StarsMap) {
  try { await AsyncStorage.setItem(AS_KEY, JSON.stringify(map)); } catch {}
}

// Merge theo “max sao từng level”
export function mergeStars(a: StarsMap, b: StarsMap): StarsMap {
  const out: StarsMap = { ...a };
  Object.keys(b).forEach(k => {
    const lv = Number(k);
    out[lv] = Math.max(a[lv] ?? 0, b[lv] ?? 0) as 0|1|2|3;
  });
  return out;
}

// Tải từ Firestore (nếu có uid)
export async function cloudGet(): Promise<StarsMap | null> {
  const u = auth.currentUser;
  if (!u) return null;
  const snap = await getDoc(caroDoc(u.uid));
  if (!snap.exists()) return {};
  const data = snap.data() as any;
  return (data.starsByLevel ?? {}) as StarsMap;
}

// Ghi Firestore – tạo doc nếu chưa có
export async function cloudUpsertStars(partial: StarsMap) {
  const u = auth.currentUser;
  if (!u) return;

  const ref = caroDoc(u.uid);
  const payload: any = { updatedAt: serverTimestamp() };
  // update từng field để giảm size write
  Object.entries(partial).forEach(([lv, s]) => {
    payload[`starsByLevel.${lv}`] = s;
  });

  try {
    // updateDoc sẽ fail nếu doc chưa tồn tại → setDoc({merge:true})
    await updateDoc(ref, payload);
  } catch {
    await setDoc(ref, { starsByLevel: {}, updatedAt: serverTimestamp() }, { merge: true });
    await updateDoc(ref, payload);
  }
}

// API public dùng trong hook

// 1) Load & hợp nhất local + cloud
export async function loadProgress(): Promise<StarsMap> {
  const [local, cloud] = await Promise.all([localGet(), cloudGet()]);
  const merged = cloud ? mergeStars(local, cloud) : local;
  // nếu cloud có dữ liệu “mới hơn”, ghi lại local cho khớp
  if (cloud) await localSet(merged);
  return merged;
}

// 2) Lưu kết quả 1 level
export async function saveResult(level: number, stars: 0|1|2|3) {
  // luôn cập nhật local ngay để UI phản hồi tức thì
  const local = await localGet();
  const best = Math.max(local[level] ?? 0, stars) as 0|1|2|3;
  const next = { ...local, [level]: best, [level + 1]: local[level + 1] ?? 0 };
  await localSet(next);

  // nếu đang đăng nhập → sync cloud
  try { await cloudUpsertStars({ [level]: best, [level + 1]: next[level + 1] }); } catch {}
  return next;
}
