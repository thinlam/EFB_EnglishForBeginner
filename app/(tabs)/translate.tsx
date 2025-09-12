// app/(tabs)/translate.tsx
import { setStringAsync } from 'expo-clipboard';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/* Firebase */
import { auth, db } from '@/scripts/firebase';
import { addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp } from 'firebase/firestore';

/* ======== Styles ======== */
const S = {
  wrap: { flex: 1, backgroundColor: '#fff' as const },
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: '700' as const, marginBottom: 12 },

  row: { flexDirection: 'row' as const, alignItems: 'center' as const },
  toggle: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, marginBottom: 8 },

  box: {
    minHeight: 110, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12,
    padding: 12, textAlignVertical: 'top' as const, fontSize: 16, backgroundColor: '#fff'
  },
  hint: { fontSize: 12, color: '#6b7280', marginTop: 6, marginBottom: 8 },

  btnRow: { flexDirection: 'row' as const, gap: 8, marginTop: 10 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' as const, backgroundColor: '#2563eb' },
  btnGrey: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' as const, backgroundColor: '#6b7280' },
  btnText: { color: '#fff', fontWeight: '600' as const },

  chip: {
    alignSelf: 'flex-start', backgroundColor: '#e8f5e9', borderRadius: 8,
    paddingVertical: 6, paddingHorizontal: 10, marginTop: 8, borderWidth: 1, borderColor: '#c8e6c9'
  },
  chipText: { color: '#1b5e20' },

  tools: { flexDirection: 'row' as const, gap: 8, marginTop: 10 },
  toolBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#e5e7eb' },
  toolText: { color: '#111827', fontWeight: '500' as const },

  sectionTitle: { marginTop: 18, marginBottom: 8, fontWeight: '700' as const },
  histItem: { padding: 10, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, marginBottom: 8 },
  histSmall: { fontSize: 12, color: '#6b7280' },

  swapBtn: { marginLeft: 'auto', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#fef3c7' },
  counterRow: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const },
  counter: { fontSize: 12, color: '#6b7280' },
  counterWarn: { fontSize: 12, color: '#b91c1c', fontWeight: '700' as const },
};

/* ======== MyMemory – dịch 2 chiều (EN|VI hoặc VI|EN) ======== */
const TRANSLATE_ENDPOINT = 'https://api.mymemory.translated.net/get';

function decodeMaybe(s: string) {
  try {
    // Nếu có pattern %xx → thử decode
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

  // encode đúng 1 lần cho tham số q
// encode đúng 1 lần cho tham số q
const url = `${TRANSLATE_ENDPOINT}?q=${encodeURIComponent(text)}&langpair=${src}|${tgt}&mt=1`;

const res = await fetch(url, { method: 'GET' });
const json = await res.json();

let out: string = json?.responseData?.translatedText || '';

  // HTML entities → ký tự thật
  out = out
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();

  // iOS: đôi khi server trả URL-encoded → giải mã
  out = decodeMaybe(out);

  // nếu trả lại y hệt input coi như fail
  if (!out || out.toLowerCase() === text.toLowerCase()) return '';
  return out;
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
  const [srcText, setSrcText] = useState(''); // nguồn (có thể EN hoặc VI)
  const [tgtText, setTgtText] = useState(''); // đích

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

  /* ======== Gõ nguồn: cắt 500 + xoá theo khi người dùng xoá ======== */
  const onChangeSrc = (val: string) => {
    // cắt ở 500
    const clipped = val.length > MAX ? val.slice(0, MAX) : val;
    // nếu đang xoá (độ dài giảm) → xoá luôn gợi ý & bản dịch để tránh lệch
    if (clipped.length < prevLenRef.current) {
      setSuggested('');
      setTgtText('');
    }
    prevLenRef.current = clipped.length;
    setSrcText(clipped);
  };

  /* ======== Debounce gợi ý ======== */
  useEffect(() => {
    if (!autoTranslate) return;
    if (!srcText.trim()) { setSuggested(''); setTgtText(''); return; }
    if (tgtText.trim().length > 0) return; // không đè khi user đã nhập tay

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        setSuggesting(true);
        const r = await translateBidirectional(srcText.trim(), srcLang, tgtLang);
        setSuggested(r || '');
      } catch {
        setSuggested('');
      } finally {
        setSuggesting(false);
      }
    }, 500);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [srcText, autoTranslate, tgtText, srcLang, tgtLang]);

  const acceptSuggestion = () => {
    if (suggested) setTgtText(suggested);
  };

  const handleTranslateManual = async () => {
    if (!srcText.trim()) { setTgtText(''); setSuggested(''); return; }
    const r = await translateBidirectional(srcText.trim(), srcLang, tgtLang);
    setTgtText(r || '');
    setSuggested(r || '');
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
    // đảo chiều
    const newSrc = tgtLang;
    const newTgt = srcLang;
    setSrcLang(newSrc);
    setTgtLang(newTgt);
    // chuyển kết quả sang nguồn để dịch ngược nếu muốn
    if (tgtText) {
      setSrcText(tgtText.slice(0, MAX));
      setTgtText('');
      setSuggested('');
      prevLenRef.current = Math.min(tgtText.length, MAX);
    }
  };

  const langLabel = (l: Lang) => (l === 'en' ? 'EN' : 'VI');

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

        {/* Nút hành động */}
        <View style={S.btnRow}>
          <TouchableOpacity style={S.btn} onPress={handleTranslateManual}>
            <Text style={S.btnText}>Dịch</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={S.btnGrey}
            onPress={() => { setSrcText(''); setTgtText(''); setSuggested(''); prevLenRef.current = 0; }}
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
