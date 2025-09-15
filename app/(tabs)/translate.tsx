
// app/(tabs)/translate.tsx
// DỊCH KHI ẨN BÀN PHÍM — KHÔNG MIC
// - Không auto 450ms nữa
// - Dịch khi nhận sự kiện keyboardDidHide
// - Swap EN/VI
// - Copy & TTS
// - Chips từng từ (EN→VI) -> IPA
// - Lưu lịch sử Firestore (20 mục gần nhất)
// - Bấm ra ngoài để ẩn bàn phím

import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { setStringAsync } from 'expo-clipboard';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/* Styles tách riêng */
import { TranslateStyles as S } from '@/components/style/TranslateStyle';

/* Firebase */
import { auth, db } from '@/scripts/firebase';
import { addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp } from 'firebase/firestore';

/* ================= Translate API (MyMemory) ================= */
const TRANSLATE_ENDPOINT = 'https://api.mymemory.translated.net/get';

function decodeMaybe(s: string) {
  try {
    if (/%[0-9A-Fa-f]{2}/.test(s)) return decodeURIComponent(s);
  } catch {}
  return s;
}

async function translateBidirectional(text: string, src: 'en' | 'vi', tgt: 'en' | 'vi'): Promise<string> {
  if (!text.trim()) return '';
  const url = `${TRANSLATE_ENDPOINT}?q=${encodeURIComponent(text)}&langpair=${src}|${tgt}&mt=1`;
  const res = await fetch(url, { method: 'GET' });
  const json = await res.json();
  let out: string = json?.responseData?.translatedText || '';
  out = out
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
  out = decodeMaybe(out);
  if (!out || out.toLowerCase() === text.toLowerCase()) return '';
  return out;
}

/* ============ Dictionary (IPA + audio) ============ */
type Pron = { ipa?: string; audio?: string };
const DICT_ENDPOINT = (w: string) => `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(w)}`;

async function fetchPronunciationEn(word: string): Promise<Pron | null> {
  try {
    const res = await fetch(DICT_ENDPOINT(word));
    if (!res.ok) return null;
    const data = await res.json();
    const first = Array.isArray(data) ? data[0] : null;
    const phonetics: any[] = first?.phonetics || [];
    const withAudio = phonetics.find((p) => p?.audio) || phonetics[0];
    const ipa: string | undefined = withAudio?.text || phonetics.find((p) => p?.text)?.text || undefined;
    const audio: string | undefined = withAudio?.audio || undefined;
    if (!ipa && !audio) return null;
    return { ipa, audio };
  } catch {
    return null;
  }
}

type Lang = 'en' | 'vi';

export default function TranslateScreen() {
  const router = useRouter();

  /* ======== State ======== */
  const [srcLang, setSrcLang] = useState<Lang>('en');
  const [tgtLang, setTgtLang] = useState<Lang>('vi');
  const [srcText, setSrcText] = useState('');
  const [tgtText, setTgtText] = useState('');

  const MAX = 500;
  const prevLenRef = useRef(0);

  /* ======== Refs để đọc state mới nhất trong listener ======== */
  const srcTextRef = useRef(srcText);
  const srcLangRef = useRef(srcLang);
  const tgtLangRef = useRef(tgtLang);
  const lastHashRef = useRef<string>(''); // nhớ lần dịch gần nhất để khỏi gọi lại khi không đổi

  useEffect(() => { srcTextRef.current = srcText; }, [srcText]);
  useEffect(() => { srcLangRef.current = srcLang; }, [srcLang]);
  useEffect(() => { tgtLangRef.current = tgtLang; }, [tgtLang]);

  const makeHash = (txt: string, s: Lang, t: Lang) => `${s}|${t}|${txt.trim()}`;

  /* ======== History ======== */
  const [history, setHistory] = useState<any[]>([]);
  async function loadHistory() {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const qRef = query(collection(db, 'translations'), orderBy('createdAt', 'desc'), limit(20));
      const snap = await getDocs(qRef);
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((it: any) => it.uid === user.uid);
      setHistory(rows);
    } catch {}
  }
  useEffect(() => { loadHistory(); }, []);

  async function saveHistory(src: string, result: string, s: Lang, t: Lang) {
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, 'translations'), {
        uid: user?.uid || null,
        srcText: src,
        result,
        srcLang: s,
        tgtLang: t,
        createdAt: serverTimestamp(),
      });
      loadHistory();
    } catch {}
  }

  /* ======== Gõ nguồn ======== */
  const onChangeSrc = (val: string) => {
    const clipped = val.length > MAX ? val.slice(0, MAX) : val;
    if (clipped.length < prevLenRef.current) {
      setTgtText('');
      setSelectedWord('');
      setPron(null);
      lastHashRef.current = ''; // cho phép dịch lại sau khi ẩn bàn phím
    }
    prevLenRef.current = clipped.length;
    setSrcText(clipped);
  };

  /* ======== DỊCH KHI ẨN BÀN PHÍM ======== */
  const translateOnKeyboardHide = async () => {
    const txt = srcTextRef.current.trim();
    const s = srcLangRef.current;
    const t = tgtLangRef.current;

    if (!txt) { setTgtText(''); lastHashRef.current = ''; return; }

    const hash = makeHash(txt, s, t);
    if (hash === lastHashRef.current) return; // không thay đổi => khỏi gọi API

    try {
      const r = await translateBidirectional(txt, s, t);
      setTgtText(r || '');
      if (r) saveHistory(srcTextRef.current, r, s, t);
      lastHashRef.current = hash;
    } catch {}
  };

  // Lắng nghe keyboardDidHide một lần
  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidHide', translateOnKeyboardHide);
    return () => sub.remove();
  }, []); // không deps để listener không bị re-register

  /* ======== Tools ======== */
  const copySource = async () => { await setStringAsync(srcText || ''); if (srcText) Alert.alert('Đã sao chép', 'Đã copy văn bản nguồn.'); };
  const copyResult = async () => { await setStringAsync(tgtText || ''); if (tgtText) Alert.alert('Đã sao chép', 'Đã copy bản dịch.'); };
  const speak = (text: string, lang: Lang) => {
    const voice = lang === 'vi' ? 'vi-VN' : 'en-US';
    if (!text.trim()) return;
    Speech.stop();
    Speech.speak(text, { language: voice, rate: 1.0, pitch: 1.0 });
  };

  /* ======== Swap ======== */
  const swapLangs = () => {
    const newSrc = tgtLang;
    const newTgt = srcLang;
    setSrcLang(newSrc);
    setTgtLang(newTgt);
    if (tgtText) {
      setSrcText(tgtText.slice(0, MAX));
      setTgtText('');
      prevLenRef.current = Math.min(tgtText.length, MAX);
      setSelectedWord(''); setPron(null);
    }
    // buộc dịch lại ở lần ẩn bàn phím tới
    lastHashRef.current = '';
  };

  const langFull = (l: Lang) => (l === 'en' ? 'English' : 'Vietnamese');
  const flagOf = (l: Lang) =>
    l === 'en'
      ? require('@/assets/images/CO-MI.png')
      : require('@/assets/images/CO-VIETNAM.png');

  /* ======== Pronounce per word ======== */
  const [selectedWord, setSelectedWord] = useState('');
  const [pron, setPron] = useState<Pron | null>(null);
  const [loadingPron, setLoadingPron] = useState(false);
  const pronCacheRef = useRef<Record<string, Pron>>({});

  const normalizeWord = (w: string) => w.toLowerCase().replace(/^[^a-zA-Z']+|[^a-zA-Z']+$/g, '');
  const onPressWord = async (raw: string) => {
    const w = normalizeWord(raw); if (!w) return;
    setSelectedWord(w); setPron(null);
    if (pronCacheRef.current[w]) { setPron(pronCacheRef.current[w]); return; }
    setLoadingPron(true);
    const p = await fetchPronunciationEn(w);
    if (p) { pronCacheRef.current[w] = p; setPron(p); } else setPron(null);
    setLoadingPron(false);
  };

  const renderWordChips = () => {
    if (!(srcLang === 'en' && tgtLang === 'vi' && srcText.trim())) return null;
    const parts = srcText.split(/\s+/);
    return (
      <View style={S.wordChipsRow}>
        {parts.map((w, idx) => (
          <TouchableOpacity key={`${w}-${idx}`} onPress={() => onPressWord(w)} style={[S.chip, { paddingVertical: 6 }]}>
            <Text style={[S.chipText, { fontWeight: '600' }]}>{w}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderPronPanel = () => {
    if (!(srcLang === 'en' && tgtLang === 'vi' && selectedWord)) return null;
    return (
      <View style={[S.histItem, { marginTop: 8 }]}>
        <View style={S.pronHeader}>
          <Text style={S.pronWord}>{selectedWord}</Text>
          <TouchableOpacity onPress={() => speak(selectedWord, 'en')}>
            <Text style={S.pronSpeak}>🔊 Phát âm</Text>
          </TouchableOpacity>
        </View>
        {loadingPron ? (
          <View style={{ marginTop: 8 }}><ActivityIndicator /></View>
        ) : pron ? (
          <View style={{ marginTop: 6 }}>
            {pron.ipa ? (
              <Text style={S.pronIPA}>IPA: <Text style={{ fontWeight: '600' }}>{pron.ipa}</Text></Text>
            ) : (
              <Text style={S.pronHint}>Không tìm thấy phiên âm. Đã bật TTS.</Text>
            )}
          </View>
        ) : (
          <Text style={S.pronHint}>Không tìm thấy dữ liệu phát âm.</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={S.wrap}>
      {/* Bọc toàn bộ trong TouchableWithoutFeedback để ẩn bàn phím */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={S.container}>
          {/* Header chọn ngôn ngữ */}
          <View style={S.langRow}>
            <TouchableOpacity style={S.langBtn} onPress={() => setSrcLang(srcLang === 'en' ? 'vi' : 'en')}>
              <View style={S.langBtnCol}>
                <Image source={flagOf(srcLang)} style={S.flag} />
                <Text style={S.langText}>{langFull(srcLang)}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={S.swapMid} onPress={swapLangs}>
              <Text style={S.swapMidIcon}>⇆</Text>
            </TouchableOpacity>

            <TouchableOpacity style={S.langBtn} onPress={() => setTgtLang(tgtLang === 'en' ? 'vi' : 'en')}>
              <View style={S.langBtnCol}>
                <Image source={flagOf(tgtLang)} style={S.flag} />
                <Text style={S.langText}>{langFull(tgtLang)}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* CARD 1 */}
          <View style={S.card}>
            <Text style={S.cardTitle}>Translate from ({langFull(srcLang)})</Text>
            <View style={S.srcBoxWrap}>
              <TextInput
                placeholder={`Nhập ${srcLang === 'en' ? 'English' : 'Vietnamese'}... (≤ 500 ký tự)`}
                value={srcText}
                onChangeText={onChangeSrc}
                multiline
                style={S.textArea}
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
              />
              {!!srcText && (
                <TouchableOpacity
                  onPress={() => { setSrcText(''); setTgtText(''); setSelectedWord(''); setPron(null); prevLenRef.current = 0; lastHashRef.current = ''; }}
                  style={S.clearBtn}
                >
                  <Text style={S.clearBtnText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={S.counterRow}>
              <Text style={S.hint}>Gõ {srcLang === 'en' ? 'tiếng Anh' : 'tiếng Việt'} ở đây. Ẩn bàn phím để dịch.</Text>
              <Text style={srcText.length >= MAX ? S.counterWarn : S.counter}>{srcText.length}/{MAX}</Text>
            </View>
            <View style={S.actionRow}>
              <View style={{ flex: 1 }} />
              <View style={S.iconRowRight}>
                <TouchableOpacity style={S.iconBtn} onPress={copySource}>
                  <MaterialIcons name="content-copy" size={18} color="#1f2937" />
                </TouchableOpacity>
                <TouchableOpacity style={S.iconBtn} onPress={() => speak(srcText, srcLang)}>
                  <Ionicons name="volume-medium" size={18} color="#1f2937" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Chips EN→VI */}
          {renderWordChips()}

          {/* CARD 2 */}
          <View style={S.card}>
            <Text style={S.cardTitle}>Translate to ({langFull(tgtLang)})</Text>
            <TextInput
              placeholder={`Nghĩa ${tgtLang === 'vi' ? 'tiếng Việt' : 'tiếng Anh'}`}
              value={tgtText}
              onChangeText={setTgtText}
              multiline
              style={S.textArea}
              placeholderTextColor="#9ca3af"
            />
            <View style={S.actionRow}>
              <View style={{ flex: 1 }} />
              <View style={S.iconRowRight}>
                <TouchableOpacity style={S.iconBtn} onPress={copyResult}>
                  <MaterialIcons name="content-copy" size={18} color="#1f2937" />
                </TouchableOpacity>
                <TouchableOpacity style={S.iconBtn} onPress={() => speak(tgtText, tgtLang)}>
                  <Ionicons name="volume-medium" size={18} color="#1f2937" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* IPA Panel */}
          {renderPronPanel()}

          {/* History */}
          <Text style={S.sectionTitle}>Lịch sử gần đây</Text>
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            renderItem={({ item }: any) => (
              <TouchableOpacity
                style={S.histItem}
                onPress={() => {
                  setSrcLang((item.srcLang as Lang) || 'en');
                  setTgtLang((item.tgtLang as Lang) || 'vi');
                  setSrcText(item.srcText?.slice(0, MAX) || '');
                  setTgtText(item.result || '');
                  setSelectedWord(''); setPron(null);
                  prevLenRef.current = Math.min((item.srcText || '').length, MAX);
                  lastHashRef.current = ''; // ấn bàn phím xuống để dịch lại nếu cần
                }}
              >
                <Text style={S.histSmall}>
                  {String(item.srcLang).toUpperCase()} → {String(item.tgtLang).toUpperCase()}
                </Text>
                <Text numberOfLines={2} style={{ marginTop: 2 }}>{item.srcText}</Text>
                <Text numberOfLines={2} style={{ marginTop: 4, color: '#111827', fontWeight: '600' }}>{item.result}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={S.hint}>Chưa có lịch sử.</Text>}
          />
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

