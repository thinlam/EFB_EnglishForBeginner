import { auth, db } from '@/scripts/firebase';
import {
    addDoc,
    collection,
    doc,
    getDoc,
    increment,
    serverTimestamp,
    setDoc,
    updateDoc,
} from 'firebase/firestore';

interface SaveTestResultParams {
  level: string;
  score: number;
  pass: boolean;
}

export async function saveTestResult({
  level,
  score,
  pass,
}: SaveTestResultParams) {
  const user = auth.currentUser;
  if (!user) return;

  const uid = user.uid;

  // 🎯 quy đổi XP (bạn chỉnh rule tại đây)
  const xpEarned = pass ? 50 + score : 20;

  /* 1️⃣ Lưu lịch sử test */
  await addDoc(collection(db, 'testResults'), {
    uid,
    level,
    score,
    pass,
    xpEarned,
    createdAt: serverTimestamp(),
  });

  /* 2️⃣ Cập nhật userStats cho ranking */
  const statRef = doc(db, 'userStats', uid);
  const snap = await getDoc(statRef);

  if (!snap.exists()) {
    await setDoc(statRef, {
      displayName: user.displayName || 'User',
      photoURL: user.photoURL || null,
      cefrXp: xpEarned,
      testCompleted: 1,
      totalScore: score,
      avgScore: score,
      updatedAt: serverTimestamp(),
    });
  } else {
    const data = snap.data();
    const totalScore = (data.totalScore || 0) + score;
    const testCompleted = (data.testCompleted || 0) + 1;

    await updateDoc(statRef, {
      cefrXp: increment(xpEarned),
      testCompleted: increment(1),
      totalScore,
      avgScore: Math.round(totalScore / testCompleted),
      updatedAt: serverTimestamp(),
    });
  }
}
