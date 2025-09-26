import { fetchPronunciationEn, type Pron } from '@/services/dictionaryService';
import React from 'react';
import type { Lang } from './useTranslate';

export function usePronounce({ srcLang, tgtLang }: { srcLang: Lang; tgtLang: Lang }) {
  const [selectedWord, setSelectedWord] = React.useState('');
  const [pron, setPron] = React.useState<Pron | null>(null);
  const [loadingPron, setLoadingPron] = React.useState(false);
  const cacheRef = React.useRef<Record<string, Pron>>({});

  const normalizeWord = (w: string) => w.toLowerCase().replace(/^[^a-zA-Z']+|[^a-zA-Z']+$/g, '');

  const canShowExtras = srcLang === 'en' && tgtLang === 'vi';

  const onPressWord = async (raw: string) => {
    if (!canShowExtras) return;
    const w = normalizeWord(raw);
    if (!w) return;
    setSelectedWord(w);
    setPron(null);

    if (cacheRef.current[w]) { setPron(cacheRef.current[w]); return; }

    setLoadingPron(true);
    const p = await fetchPronunciationEn(w);
    if (p) { cacheRef.current[w] = p; setPron(p); }
    setLoadingPron(false);
  };

  return { selectedWord, pron, loadingPron, onPressWord, canShowExtras };
}
