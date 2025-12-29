// /services/ranking.service.ts
import { db } from '@/scripts/firebase';
import { RankingUser } from '@/types/Ranking';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';

export async function getRankingTop(top = 50): Promise<RankingUser[]> {
  const q = query(
    collection(db, 'userStats'),
    orderBy('cefrXp', 'desc'),
    orderBy('avgScore', 'desc'),
    orderBy('testCompleted', 'desc'),
    limit(top),
  );

  const snap = await getDocs(q);
  return snap.docs.map(d => ({ uid: d.id, ...d.data() } as RankingUser));
}
