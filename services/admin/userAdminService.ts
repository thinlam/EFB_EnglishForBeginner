import { db } from '@/scripts/firebase';
import type { UserAdmin } from '@/types/admin/user';
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
// users
const COL = 'users';
//lấy tất cả người dùng từ db firestore
export async function listUsers(): Promise<UserAdmin[]> {
  const snap = await getDocs(collection(db, COL));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<UserAdmin, 'id'>) }));
}
//lấy người dùng theo id từ db firestore
export async function getUserById(id: string): Promise<UserAdmin | null> {
  const ref = doc(db, COL, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id, ...(snap.data() as Omit<UserAdmin, 'id'>) };
}
//cập nhật thông tin cá nhân người dùng lên db firestore
export async function updateUser(id: string, data: Partial<UserAdmin> & { phone?: string }) {
  const ref = doc(db, COL, id);
  // dùng merge để không ghi đè các field khác
  await setDoc(ref, data, { merge: true });
}
//cập nhật chức năng (role) của người dùng lên db firestore
export async function updateUserRole(userId: string, role: string) {
  const ref = doc(db, COL, userId);
  await setDoc(ref, { role }, { merge: true });
}
// xóa người dùng khỏi db firestore
export async function deleteUserById(userId: string) {
  await deleteDoc(doc(db, COL, userId));
}
