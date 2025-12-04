import { db } from '@/scripts/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export const usePremiumPlans = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      const snap = await getDocs(collection(db, 'premium_plans'));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPlans(list);
    } catch (err) {
      console.log('❌ Error loading premium plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return { plans, loading, reload: fetch };
};
