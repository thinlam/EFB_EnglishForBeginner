import { db } from '@/scripts/firebase';
import type { UserDoc } from '@/types/auth/user';
import { doc, setDoc } from 'firebase/firestore';

export async function createUserDoc(uid: string, data: Partial<UserDoc>) {
  await setDoc(doc(db, 'users', uid), data, { merge: true });
}
