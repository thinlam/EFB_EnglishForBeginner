import { db } from '@/scripts/firebase';
import type { Vocab } from '@/types/admin/vocab';
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
// vocabulary
const COL = 'vocabulary';
// Lấy tất cả từ vựng đã được thêm vào firestore
export async function fetchVocab(): Promise<Vocab[]> {
  const snap = await getDocs(collection(db, COL));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Vocab, 'id'>) }));
}
// them mới từ vựng lên firestore
export async function addVocab(data: Omit<Vocab, 'id'>) {
  await addDoc(collection(db, COL), data);
}
//cập nhật từ vựng đã có trong firestore
export async function updateVocab(id: string, data: Omit<Vocab, 'id'>) {
  await updateDoc(doc(db, COL, id), data);
}

// xóa từ vựng khỏi firestore
export async function deleteVocab(id: string) {
  await deleteDoc(doc(db, COL, id));
}
