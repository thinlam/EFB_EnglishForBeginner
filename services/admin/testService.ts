import { db } from '@/scripts/firebase';
import type { TestQuestion, TestQuestionBase } from '@/types/admin/test';
import { addDoc, collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';

const COL = 'testQuestions';

export async function getAllQuestions(): Promise<TestQuestion[]> {
  const snap = await getDocs(collection(db, COL));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<TestQuestion, 'id'>) }));
}

export async function addQuestion(data: TestQuestionBase) {
  await addDoc(collection(db, COL), data);
}

export async function updateQuestion(id: string, data: Partial<TestQuestionBase>) {
  await setDoc(doc(db, COL, id), data, { merge: true });
}

export async function deleteQuestion(id: string) {
  await deleteDoc(doc(db, COL, id));
}
