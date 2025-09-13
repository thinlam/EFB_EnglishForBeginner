// app/(tabs)/translate.tsx
// Dịch trực tiếp khi gõ (debounce), không có nút Translate.

import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import Voice from '@react-native-voice/voice';
import { setStringAsync } from 'expo-clipboard';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  PermissionsAndroid,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
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

  // ghi âm
  const [isRecording, setIsRecording] = useState(false);

  // limit nhập
  const MAX = 500;
  const prevLenRef = useRef(0);

  // debounce dịch trực tiếp
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  /* ======== Gõ nguồn: limit + dọn phụ ======== */
  const onChangeSrc = (val: string) => {
    const clipped = val.length > MAX ? val.slice(0, MAX) : val;
    if (clipped.length < prevLenRef.current) {
      setTgtText('');
      setSelectedWord('');
      setPron(null);
    }
    prevLenRef.current = clipped.length;
    setSrcText(clipped);
  };

  /* ======== Dịch trực tiếp (debounce) ======== */
  useEffect(() => {
    if (!srcText.trim()) { setTgtText(''); return; }
    if (isRecording) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await translateBidirectional(srcText.trim(), srcLang, tgtLang);
        setTgtText(r || '');
        if (r) saveHistory(srcText, r, srcLang, tgtLang);
      } catch {}
    }, 450);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [srcText, srcLang, tgtLang, isRecording]);

  /* ======== Copy & TTS ======== */
  const copySource = async () => { await setStringAsync(srcText || ''); if (srcText) Alert.alert('Đã sao chép', 'Đã copy văn bản nguồn.'); };
  const copyResult = async () => { await setStringAsync(tgtText || ''); if (tgtText) Alert.alert('Đã sao chép', 'Đã copy bản dịch.'); };
  const speak = (text: string, lang: Lang) => {
    const voice = lang === 'vi' ? 'vi-VN' : 'en-US';
    if (!text.trim()) return;
    Speech.stop(); Speech.speak(text, { language: voice, rate: 1.0, pitch: 1.0 });
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
  };

  const langFull = (l: Lang) => (l === 'en' ? 'English' : 'Vietnamese');
  const langShort = (l: Lang) => (l === 'en' ? 'EN' : 'VI');
  const localeOf = (l: Lang) => (l === 'en' ? 'en-US' : 'vi-VN');

  /* ======== Voice setup ======== */
  useEffect(() => {
    Voice.onSpeechResults = (e: any) => {
      const text = e?.value?.[0] || '';
      if (text) onChangeSrc(text);
    };
    Voice.onSpeechError = () => setIsRecording(false);
    Voice.onSpeechEnd = () => setIsRecording(false);
    return () => { Voice.destroy().then(Voice.removeAllListeners); };
  }, []);

  const ensureMicPermission = async () => {
    if (Platform.OS !== 'android') return true;
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const toggleRecord = async () => {
    try {
      if (!isRecording) {
        const ok = await ensureMicPermission();
        if (!ok) { Alert.alert('Thiếu quyền', 'App cần quyền micro để ghi âm.'); return; }
        setIsRecording(true);
        await Voice.start(localeOf(srcLang));
      } else {
        setIsRecording(false);
        await Voice.stop();
      }
    } catch { setIsRecording(false); }
  };

  /* ======== Pronounce per word (EN→VI) ======== */
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
      <View style={S.container}>
        {/* Header chọn ngôn ngữ + Swap */}
        <View style={S.langRow}>
          <TouchableOpacity style={S.langBtn} onPress={() => setSrcLang(srcLang === 'en' ? 'vi' : 'en')}>
            <Text style={S.langText}>{langFull(srcLang)}</Text>
            <Text style={S.langSub}>{langShort(srcLang)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={S.swapMid} onPress={swapLangs}>
            <Text style={S.swapMidIcon}>⇆</Text>
          </TouchableOpacity>

          <TouchableOpacity style={S.langBtn} onPress={() => setTgtLang(tgtLang === 'en' ? 'vi' : 'en')}>
            <Text style={S.langText}>{langFull(tgtLang)}</Text>
            <Text style={S.langSub}>{langShort(tgtLang)}</Text>
          </TouchableOpacity>
        </View>

        {/* CARD 1: Translate from */}
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
                onPress={() => { setSrcText(''); setTgtText(''); setSelectedWord(''); setPron(null); prevLenRef.current = 0; }}
                style={S.clearBtn}
              >
                <Text style={S.clearBtnText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={S.counterRow}>
            <Text style={S.hint}>Gõ {srcLang === 'en' ? 'tiếng Anh' : 'tiếng Việt'} ở đây.</Text>
            <Text style={srcText.length >= MAX ? S.counterWarn : S.counter}>{srcText.length}/{MAX}</Text>
          </View>

          {/* Hành động: chỉ còn copy, speak, mic */}
          <View style={S.actionRow}>
            <View style={{ flex: 1 }} />
            <View style={S.iconRowRight}>
              <TouchableOpacity style={S.iconBtn} onPress={copySource} accessibilityLabel="Copy source">
                <MaterialIcons name="content-copy" size={18} color="#1f2937" />
              </TouchableOpacity>
              <TouchableOpacity style={S.iconBtn} onPress={() => speak(srcText, srcLang)} accessibilityLabel="Speak source">
                <Ionicons name="volume-medium" size={18} color="#1f2937" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[S.iconBtnMic, isRecording && S.iconBtnMicOn]}
                onPress={toggleRecord}
                accessibilityLabel={isRecording ? 'Stop recording' : 'Start recording'}
              >
                <MaterialCommunityIcons name={isRecording ? 'microphone' : 'microphone-outline'} size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Chips từ (EN→VI) */}
        {renderWordChips()}

        {/* CARD 2: Translate to */}
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
              <TouchableOpacity style={S.iconBtn} onPress={copyResult} accessibilityLabel="Copy result">
                <MaterialIcons name="content-copy" size={18} color="#1f2937" />
              </TouchableOpacity>
              <TouchableOpacity style={S.iconBtn} onPress={() => speak(tgtText, tgtLang)} accessibilityLabel="Speak result">
                <Ionicons name="volume-medium" size={18} color="#1f2937" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Pronounce panel */}
        {renderPronPanel()}

        {/* History */}
        <Text style={S.sectionTitle}>🕘 Lịch sử gần đây</Text>
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
    </SafeAreaView>
  );
}
