import { auth, db } from '@/scripts/firebase';
import {
    addDoc, collection, getDocs, limit, orderBy, query,
    serverTimestamp, where, writeBatch,
} from 'firebase/firestore';
import React from 'react';
import type { Lang } from './useTranslate';

type PickCb = (p: { src: string; res: string; s: Lang; t: Lang }) => void;

export function useTranslateHistory(opts?: { onPick?: PickCb }) {
  const [history, setHistory] = React.useState<any[]>([]);

  const loadHistory = React.useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const qRef = query(collection(db, 'translations'), orderBy('createdAt', 'desc'), limit(20));
      const snap = await getDocs(qRef);
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((it: any) => it.uid === user.uid);
      setHistory(rows);
    } catch {}
  }, []);

  const saveHistory = React.useCallback(async (src: string, result: string, s: Lang, t: Lang) => {
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, 'translations'), {
        uid: user?.uid || null, srcText: src, result, srcLang: s, tgtLang: t, createdAt: serverTimestamp(),
      });
      loadHistory();
    } catch {}
  }, [loadHistory]);

  const confirmAndClearHistory = React.useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const PAGE = 400;
      for (;;) {
        const qRef = query(collection(db, 'translations'), where('uid', '==', user.uid), limit(PAGE));
        const snap = await getDocs(qRef);
        if (snap.empty) break;
        const batch = writeBatch(db);
        snap.docs.forEach((docSnap) => batch.delete(docSnap.ref));
        await batch.commit();
      }
      setHistory([]);
    } catch {}
  }, []);

  const pickHistoryItem = (item: any) => {
    opts?.onPick?.({
      src: item.srcText || '',
      res: item.result || '',
      s: (item.srcLang as Lang) || 'en',
      t: (item.tgtLang as Lang) || 'vi',
    });
  };

  return { history, loadHistory, saveHistory, confirmAndClearHistory, pickHistoryItem };
}
