// /hooks/ranking/useRanking.ts
import { getRankingTop } from '@/services/ranking.service';
import { RankingUser } from '@/types/Ranking';
import { useEffect, useState } from 'react';

export function useRanking() {
  const [data, setData] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRankingTop()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}
