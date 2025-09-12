// app/(tabs)/translate.tsx
import { setStringAsync } from 'expo-clipboard';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/* Styles tách riêng */
import { TranslateStyles as S } from '@/components/style/TranslateStyle';

/* Firebase */
import { auth, db } from '@/scripts/firebase';
import { addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp } from 'firebase/firestore';

/* ================= MyMemory – dịch 2 chiều (EN|VI hoặc VI|EN) ================= */
const TRANSLATE_ENDPOINT = 'https://api.mymemory.translated.net/get';

/* ============ Dictionary (IPA + audio) ============ */
type Pron = { ipa?: string; audio?: string };
const DICT_ENDPOINT = (w: string) => `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(w)}`;

function decodeMaybe(s: string) {
  try {
    if (/%[0-9A-Fa-f]{2}/.test(s)) return decodeURIComponent(s);
  } catch {}
  return s;
}

async function translateBidirectional(
  text: string,
  src: 'en' | 'vi',
  tgt: 'en' | 'vi'
): Promise<string> {
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

/** Lấy IPA + audio cho từ tiếng Anh (có cache). */
async function fetchPronunciationEn(word: string): Promise<Pron | null> {
  try {
    const res = await fetch(DICT_ENDPOINT(word));
    if (!res.ok) return null;
    const data = await res.json();

    // data[0].phonetics: [{ text: "/wɜːd/", audio: "..." }, ...]
    const first = Array.isArray(data) ? data[0] : null;
    const phonetics: any[] = first?.phonetics || [];
    // Ưu tiên bản có audio, nếu không có thì lấy bản có text (IPA)
    const withAudio = phonetics.find(p => p?.audio) || phonetics[0];

    const ipa: string | undefined =
      withAudio?.text ||
      (phonetics.find(p => p?.text)?.text) ||
      undefined;
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

  /* ======== Trạng thái ======== */
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [suggesting, setSuggesting] = useState(false);
  const [suggested, setSuggested] = useState('');

  // Hướng dịch
  const [srcLang, setSrcLang] = useState<Lang>('en');
  const [tgtLang, setTgtLang] = useState<Lang>('vi');

  // Văn bản
  const [srcText, setSrcText] = useState('');
  const [tgtText, setTgtText] = useState('');

  // Giới hạn ký tự
  const MAX = 500;
  const prevLenRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ======== Lịch sử ======== */
  const [history, setHistory] = useState<any[]>([]);
  async function loadHistory() {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const qRef = query(collection(db, 'translations'), orderBy('createdAt', 'desc'), limit(20));
      const snap = await getDocs(qRef);
      const rows = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter((it: any) => it.uid === user.uid);
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
      setSuggested('');
      setTgtText('');
      // Nếu đang xóa, cũng hạ panel phát âm
      setSelectedWord('');
      setPron(null);
    }
    prevLenRef.current = clipped.length;
    setSrcText(clipped);
  };

  // --- thay useEffect auto dịch ---
useEffect(() => {
  if (!autoTranslate) return;
  if (!srcText.trim()) { 
    setTgtText(''); 
    return; 
  }

  if (debounceRef.current) clearTimeout(debounceRef.current);
  debounceRef.current = setTimeout(async () => {
    try {
      setSuggesting(true);
      const r = await translateBidirectional(srcText.trim(), srcLang, tgtLang);
      setTgtText(r || '');
      if (r) saveHistory(srcText, r, srcLang, tgtLang);
    } catch {
      setTgtText('');
    } finally {
      setSuggesting(false);
    }
  }, 500);

  return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
}, [srcText, autoTranslate, srcLang, tgtLang]);

// --- bỏ toàn bộ biến/logic liên quan đến suggested & acceptSuggestion ---
// const [suggested, setSuggested] = useState('');
// chip gợi ý ... => xoá luôn


  // const acceptSuggestion = () => { if (suggested) setTgtText(suggested); };

  const handleTranslateManual = async () => {
  if (!srcText.trim()) { setTgtText(''); return; }
  const r = await translateBidirectional(srcText.trim(), srcLang, tgtLang);
  setTgtText(r || '');
  if (r) saveHistory(srcText, r, srcLang, tgtLang);
};


  /* ======== Tools ======== */
  const copyResult = async () => {
    await setStringAsync(tgtText || '');
    if (tgtText) Alert.alert('Đã sao chép', 'Kết quả đã copy vào clipboard.');
  };
  const speak = (text: string, lang: Lang) => {
    const voice = lang === 'vi' ? 'vi-VN' : 'en-US';
    if (!text.trim()) return;
    Speech.stop();
    Speech.speak(text, { language: voice, rate: 1.0, pitch: 1.0 });
  };

  const swapLangs = () => {
    const newSrc = tgtLang;
    const newTgt = srcLang;
    setSrcLang(newSrc);
    setTgtLang(newTgt);
    if (tgtText) {
      setSrcText(tgtText.slice(0, MAX));
      setTgtText('');
      setSuggested('');
      prevLenRef.current = Math.min(tgtText.length, MAX);
      // Reset panel phát âm khi đổi chiều
      setSelectedWord('');
      setPron(null);
    }
  };

  const langLabel = (l: Lang) => (l === 'en' ? 'EN' : 'VI');

  /* ======== Phát âm khi chạm từ EN ======== */
  const [selectedWord, setSelectedWord] = useState('');
  const [pron, setPron] = useState<Pron | null>(null);
  const [loadingPron, setLoadingPron] = useState(false);
  const pronCacheRef = useRef<Record<string, Pron>>({});

  const normalizeWord = (w: string) => w.toLowerCase().replace(/^[^a-zA-Z']+|[^a-zA-Z']+$/g, '');

  const onPressWord = async (raw: string) => {
    const w = normalizeWord(raw);
    if (!w) return;
    setSelectedWord(w);
    setPron(null);
    // Cache
    if (pronCacheRef.current[w]) {
      setPron(pronCacheRef.current[w]);
      return;
    }
    setLoadingPron(true);
    const p = await fetchPronunciationEn(w);
    if (p) {
      pronCacheRef.current[w] = p;
      setPron(p);
    } else {
      setPron(null);
    }
    setLoadingPron(false);
  };

  const renderWordChips = () => {
    if (!(srcLang === 'en' && tgtLang === 'vi' && srcText.trim())) return null;
    const parts = srcText.split(/\s+/);
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontWeight: '700', fontSize: 16 }}>{selectedWord}</Text>
          <TouchableOpacity onPress={() => speak(selectedWord, 'en')}>
            <Text style={{ fontWeight: '600' }}>🔊 Phát âm</Text>
          </TouchableOpacity>
        </View>

        {loadingPron ? (
          <View style={{ marginTop: 8 }}><ActivityIndicator /></View>
        ) : pron ? (
          <View style={{ marginTop: 6 }}>
            {pron.ipa ? <Text style={{ fontSize: 16, color: '#374151' }}>IPA: <Text style={{ fontWeight: '600' }}>{pron.ipa}</Text></Text> : null}
            {/* Nếu muốn phát audio chuẩn từ API (ngoài TTS), có thể dùng AV của expo-av. Ở đây dùng TTS cho đơn giản. */}
            {!pron.ipa && <Text style={{ color: '#6b7280' }}>Không tìm thấy phiên âm. Đã bật TTS.</Text>}
          </View>
        ) : (
          <Text style={{ marginTop: 6, color: '#6b7280' }}>Không tìm thấy dữ liệu phát âm.</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={S.wrap}>
      <View style={S.container}>
        <Text style={S.title}>🌐 Dịch văn bản ({langLabel(srcLang)} → {langLabel(tgtLang)})</Text>

        {/* Auto-dịch & đảo chiều */}
        <View style={[S.row, { gap: 8 }]}>
          <TouchableOpacity
            onPress={() => setAutoTranslate(v => !v)}
            style={[S.toggle, { backgroundColor: autoTranslate ? '#2e7d32' : '#6b7280' }]}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>
              {autoTranslate ? 'Auto-dịch: BẬT' : 'Auto-dịch: TẮT'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={S.swapBtn} onPress={swapLangs}>
            <Text>↔️ Đảo {langLabel(srcLang)} / {langLabel(tgtLang)}</Text>
          </TouchableOpacity>
        </View>

        {/* Ô nhập nguồn */}
        <TextInput
          placeholder={`Nhập ${srcLang === 'en' ? 'tiếng Anh' : 'tiếng Việt'}... (tối đa 500 ký tự)`}
          value={srcText}
          onChangeText={onChangeSrc}
          multiline
          style={S.box}
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
        />
        <View style={S.counterRow}>
          <Text style={S.hint}>
            Gõ {srcLang === 'en' ? 'tiếng Anh' : 'tiếng Việt'} ở đây. Gợi ý giống màn admin.
          </Text>
          <Text style={srcText.length >= MAX ? S.counterWarn : S.counter}>
            {srcText.length}/{MAX}
          </Text>
        </View>

        {/* Khi EN→VI: hiển thị chips từng từ để chạm lấy IPA */}
        {renderWordChips()}

        {/* Chip gợi ý */}
        {autoTranslate && !tgtText.trim() ? (
          <View>
            {suggesting ? (
              <View style={{ marginTop: 8, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6 }}>
                <ActivityIndicator />
              </View>
            ) : suggested ? (
              <TouchableOpacity onPress={acceptSuggestion} style={S.chip}>
                <Text style={S.chipText}>Gợi ý: {suggested} (bấm để dán)</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        {/* Ô kết quả */}
        <View style={{ marginTop: 12 }}>
          <TextInput
            placeholder={`Nghĩa ${tgtLang === 'vi' ? 'tiếng Việt' : 'tiếng Anh'}`}
            value={tgtText}
            onChangeText={setTgtText}
            multiline
            style={S.box}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Panel phát âm nằm NGAY BÊN DƯỚI kết quả */}
        {renderPronPanel()}

        {/* Nút hành động */}
        <View style={S.btnRow}>
          <TouchableOpacity style={S.btn} onPress={handleTranslateManual}>
            <Text style={S.btnText}>Dịch</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={S.btnGrey}
            onPress={() => {
              setSrcText(''); setTgtText(''); setSuggested('');
              setSelectedWord(''); setPron(null);
              prevLenRef.current = 0;
            }}
          >
            <Text style={S.btnText}>Xoá</Text>
          </TouchableOpacity>
        </View>

        {/* Tools */}
        <View style={S.tools}>
          <TouchableOpacity style={S.toolBtn} onPress={copyResult}><Text style={S.toolText}>📋 Copy</Text></TouchableOpacity>
          <TouchableOpacity style={S.toolBtn} onPress={() => speak(srcText, srcLang)}><Text style={S.toolText}>🔊 Đọc {langLabel(srcLang)}</Text></TouchableOpacity>
          <TouchableOpacity style={S.toolBtn} onPress={() => speak(tgtText, tgtLang)}><Text style={S.toolText}>🔊 Đọc {langLabel(tgtLang)}</Text></TouchableOpacity>
        </View>

        {/* Lịch sử */}
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
                setSuggested(item.result || '');
                setSelectedWord('');
                setPron(null);
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
