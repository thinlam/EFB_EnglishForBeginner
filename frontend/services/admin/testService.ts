import { db } from '@/scripts/firebase';
import type { TestQuestion, TestQuestionBase } from '@/types/admin/test';
import { addDoc, collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
// testQuestions
const COL = 'testQuestions';
// Lấy tất cả câu hỏi
export async function getAllQuestions(): Promise<TestQuestion[]> {
  const snap = await getDocs(collection(db, COL));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<TestQuestion, 'id'>) }));
}
// Thêm câu hỏi mới
export async function addQuestion(data: TestQuestionBase) {
  await addDoc(collection(db, COL), data);
}
// Cập nhật câu hỏi
export async function updateQuestion(id: string, data: Partial<TestQuestionBase>) {
  await setDoc(doc(db, COL, id), data, { merge: true });
}
// Xoá câu hỏi
export async function deleteQuestion(id: string) {
  await deleteDoc(doc(db, COL, id));
}
