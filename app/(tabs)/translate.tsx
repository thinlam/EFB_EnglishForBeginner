import { setStringAsync } from 'expo-clipboard'; // ✅ SỬA
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/* Firebase */
import { auth, db } from '@/scripts/firebase';
import { addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp } from 'firebase/firestore';

/* ======== Styles đơn giản (bạn có thể thay bằng style hệ thống của app) ======== */
const S = {
  wrap: { flex: 1, backgroundColor: '#fff' as const },
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: '700' as const, marginBottom: 12 },
  row: { flexDirection: 'row' as const, alignItems: 'center' as const },
  chip: {
    paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8,
    backgroundColor: '#eef2ff', marginRight: 8,
  },
  chipText: { color: '#1f2937' },
  swapBtn: {
    marginLeft: 'auto', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#fef3c7'
  },
  box: {
    minHeight: 110, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12,
    padding: 12, textAlignVertical: 'top' as const, fontSize: 16,
    backgroundColor: '#fff'
  },
  hint: { fontSize: 12, color: '#6b7280', marginTop: 6, marginBottom: 8 },
  btnRow: { flexDirection: 'row' as const, gap: 8, marginTop: 10 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' as const, backgroundColor: '#2563eb' },
  btnGrey: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' as const, backgroundColor: '#6b7280' },
  btnText: { color: '#fff', fontWeight: '600' as const },
  resultWrap: { marginTop: 14 },
  resultBox: {
    minHeight: 110, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12,
    padding: 12, backgroundColor: '#f8fafc'
  },
  tools: { flexDirection: 'row' as const, gap: 8, marginTop: 10 },
  toolBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#e5e7eb' },
  toolText: { color: '#111827', fontWeight: '500' as const },
  sectionTitle: { marginTop: 18, marginBottom: 8, fontWeight: '700' as const },
  histItem: {
    padding: 10, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, marginBottom: 8
  },
  histSmall: { fontSize: 12, color: '#6b7280' },
};

/* ======== API Dịch (MyMemory) – có thể thay sau này bằng server riêng ======== */
const TRANSLATE_ENDPOINT = 'https://api.mymemory.translated.net/get';
async function translate(text: string, from: string, to: string): Promise<string> {
  if (!text.trim()) return '';
  const url = `${TRANSLATE_ENDPOINT}?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
  const res = await fetch(url);
  const json = await res.json();
  const raw: string | undefined = json?.responseData?.translatedText;
  const cleaned = (raw || '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();
  return cleaned;
}

/* ======== Ngôn ngữ ======== */
type Lang = 'auto' | 'en' | 'vi';
const LANG_LABEL: Record<Lang, string> = { auto: 'Auto', en: 'English', vi: 'Tiếng Việt' };

/* ======== Màn hình Dịch ======== */
export default function TranslateScreen() {
  const router = useRouter();

  const [srcLang, setSrcLang] = useState<Lang>('auto');
  const [tgtLang, setTgtLang] = useState<Lang>('vi');

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoMode, setAutoMode] = useState(true);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ======== Lịch sử dịch (Firestore) ======== */
  const [history, setHistory] = useState<any[]>([]);
  async function loadHistory() {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const qRef = query(
        collection(db, 'translations'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const snap = await getDocs(qRef);
      const rows = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter((it: any) => it.uid === user.uid); // nếu chưa tạo index theo uid, lọc tạm
      setHistory(rows);
    } catch (e) {
      // bỏ qua
    }
  }
  useEffect(() => { loadHistory(); }, []);

  async function saveHistory(srcText: string, result: string, src: Lang, tgt: Lang) {
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, 'translations'), {
        uid: user?.uid || null,
        srcText,
        result,
        srcLang: src,
        tgtLang: tgt,
        createdAt: serverTimestamp(),
      });
      loadHistory();
    } catch (e) {
      // không chặn UI nếu lỗi
    }
  }

  /* ======== Dịch thủ công ======== */
  const doTranslate = async () => {
    if (!input.trim()) { setOutput(''); return; }
    if (srcLang === tgtLang && srcLang !== 'auto') {
      setOutput(input);
      return;
    }
    setLoading(true);
    try {
      const from = srcLang;
      const to = tgtLang === 'auto' ? (srcLang === 'en' ? 'vi' : 'en') : tgtLang;
      const result = await translate(input, from, to);
      setOutput(result);
      saveHistory(input, result, from, to as Lang);
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể dịch lúc này.');
    } finally {
      setLoading(false);
    }
  };

  /* ======== Auto-translate (debounce 500ms) ======== */
  useEffect(() => {
    if (!autoMode) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(doTranslate, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [input, srcLang, tgtLang, autoMode]);

  /* ======== Hành động phụ ======== */
  const swapLangs = () => {
    if (srcLang === 'auto') {
      setSrcLang('vi');
      setTgtLang('en');
    } else {
      setSrcLang(tgtLang === 'auto' ? 'auto' : (tgtLang as Lang));
      setTgtLang(srcLang);
    }
    if (output) {
      setInput(output);
      setOutput('');
    }
  };

  const copyResult = async () => {
    await setStringAsync(output || '');    // ✅ SỬA
    if (output) Alert.alert('Đã sao chép', 'Kết quả đã copy vào clipboard.');
  };

  const speak = (text: string, lang: Lang) => {
    const voice = lang === 'vi' ? 'vi-VN' : 'en-US';
    if (!text.trim()) return;
    Speech.stop();
    Speech.speak(text, { language: voice, rate: 1.0, pitch: 1.0 });
  };

  /* ======== Component chip chọn ngôn ngữ ======== */
  const LangChips = ({ value, onChange }: { value: Lang, onChange: (l: Lang) => void }) => (
    <View style={[S.row, { marginBottom: 10 }]}>
      {(['auto','en','vi'] as Lang[]).map((l) => (
        <TouchableOpacity
          key={l}
          onPress={() => onChange(l)}
          style={[S.chip, { backgroundColor: value === l ? '#dbeafe' : '#eef2ff' }]}
        >
          <Text style={S.chipText}>{LANG_LABEL[l]}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={S.wrap}>
      <View style={S.container}>
        <Text style={S.title}>🌐 Dịch văn bản</Text>

        {/* Ngôn ngữ nguồn */}
        <Text style={{ fontWeight: '600', marginBottom: 6 }}>Ngôn ngữ nguồn</Text>
        <LangChips value={srcLang} onChange={setSrcLang} />

        {/* Ngôn ngữ đích + nút đảo */}
        <View style={S.row}>
          <Text style={{ fontWeight: '600' }}>Ngôn ngữ đích</Text>
          <TouchableOpacity style={S.swapBtn} onPress={swapLangs}>
            <Text>↔️ Đảo chiều</Text>
          </TouchableOpacity>
        </View>
        <LangChips value={tgtLang} onChange={setTgtLang} />

        {/* Ô nhập */}
        <TextInput
          placeholder="Nhập văn bản cần dịch..."
          value={input}
          onChangeText={setInput}
          multiline
          style={S.box}
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
        />
        <Text style={S.hint}>
          {autoMode ? 'Tự dịch sau 0.5s...' : 'Chế độ thủ công: bấm nút Dịch'}
        </Text>

        {/* Nút hành động */}
        <View style={S.btnRow}>
          <TouchableOpacity style={S.btn} onPress={doTranslate} disabled={loading}>
            <Text style={S.btnText}>{loading ? 'Đang dịch...' : 'Dịch'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={S.btnGrey}
            onPress={() => setAutoMode(v => !v)}
          >
            <Text style={S.btnText}>{autoMode ? 'Auto: BẬT' : 'Auto: TẮT'}</Text>
          </TouchableOpacity>
        </View>

        {/* Kết quả */}
        <View style={S.resultWrap}>
          <Text style={{ fontWeight: '600', marginBottom: 6 }}>Kết quả</Text>
          <View style={S.resultBox}>
            <Text>{output || '—'}</Text>
          </View>
          <View style={S.tools}>
            <TouchableOpacity style={S.toolBtn} onPress={copyResult}><Text style={S.toolText}>📋 Copy</Text></TouchableOpacity>
            <TouchableOpacity style={S.toolBtn} onPress={() => speak(input, srcLang)}><Text style={S.toolText}>🔊 Đọc nguồn</Text></TouchableOpacity>
            <TouchableOpacity style={S.toolBtn} onPress={() => speak(output, tgtLang)}><Text style={S.toolText}>🔊 Đọc kết quả</Text></TouchableOpacity>
            <TouchableOpacity style={S.toolBtn} onPress={() => { setInput(''); setOutput(''); }}><Text style={S.toolText}>🧹 Xoá</Text></TouchableOpacity>
          </View>
        </View>

        {/* Lịch sử */}
        <Text style={S.sectionTitle}>🕘 Lịch sử gần đây</Text>
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }: any) => (
            <TouchableOpacity
              style={S.histItem}
              onPress={() => { setInput(item.srcText || ''); setOutput(item.result || ''); setSrcLang(item.srcLang || 'auto'); setTgtLang(item.tgtLang || 'vi'); }}
            >
              <Text style={S.histSmall}>
                {LANG_LABEL[item.srcLang as Lang]} → {LANG_LABEL[item.tgtLang as Lang]}
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
