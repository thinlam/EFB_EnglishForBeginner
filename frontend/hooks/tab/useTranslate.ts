import { translateBidirectional } from '@/services/translateService';
import { setStringAsync } from 'expo-clipboard';
import * as Speech from 'expo-speech';
import React from 'react';
import { useTranslateHistory } from './useTranslateHistory';



export type Lang = 'en' | 'vi';

export function useTranslate() {
  const [srcLang, setSrcLang] = React.useState<Lang>('en');
  const [tgtLang, setTgtLang] = React.useState<Lang>('vi');
  const [srcText, setSrcText] = React.useState('');
  const [tgtText, setTgtText] = React.useState('');
  const MAX = 500;

  const prevLenRef = React.useRef(0);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const { saveHistory } = useTranslateHistory(); // dùng để lưu khi có kết quả

  const onChangeSrc = (val: string) => {
    const clipped = val.length > MAX ? val.slice(0, MAX) : val;
    if (clipped.length < prevLenRef.current) setTgtText('');
    prevLenRef.current = clipped.length;
    setSrcText(clipped);
  };

  // Debounce translate
  React.useEffect(() => {
    if (!srcText.trim()) { setTgtText(''); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await translateBidirectional(srcText.trim(), srcLang, tgtLang);
        setTgtText(r || '');
        if (r) saveHistory(srcText, r, srcLang, tgtLang);
      } catch {}
    }, 450);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [srcText, srcLang, tgtLang, saveHistory]);

  const setLangs = (s: Lang, t: Lang) => { setSrcLang(s); setTgtLang(t); };

  const swapLangs = (forcedS?: Lang, forcedT?: Lang) => {
    if (forcedS && forcedT) { setLangs(forcedS, forcedT); return; }
    const newSrc = tgtLang; const newTgt = srcLang;
    setLangs(newSrc, newTgt);
    if (tgtText) {
      setSrcText(tgtText.slice(0, MAX));
      setTgtText('');
      prevLenRef.current = Math.min(tgtText.length, MAX);
    }
  };

  const copySource = async () => { await setStringAsync(srcText || ''); };
  const copyResult = async () => { await setStringAsync(tgtText || ''); };

  const speak = (text: string, lang: Lang) => {
    const voice = lang === 'vi' ? 'vi-VN' : 'en-US';
    if (!text.trim()) return;
    Speech.stop();
    Speech.speak(text, { language: voice, rate: 1.0, pitch: 1.0 });
  };

  return {
    srcLang, tgtLang, srcText, tgtText, MAX,
    setTgtText, onChangeSrc, swapLangs, setLangs,
    copySource, copyResult, speak,
  };
}
