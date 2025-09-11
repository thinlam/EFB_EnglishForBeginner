// app/(tabs)/translate.tsx
import { setStringAsync } from 'expo-clipboard';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/* Firebase */
import { auth, db } from '@/scripts/firebase';
import { addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp } from 'firebase/firestore';

/* ======== Styles (có thể thay bằng Theme của bạn) ======== */
const S = {
  wrap: { flex: 1, backgroundColor: '#fff' as const },
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: '700' as const, marginBottom: 12 },

  row: { flexDirection: 'row' as const, alignItems: 'center' as const },
  toggle: {
    paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, marginBottom: 8,
  },

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
    paddingVertical: 6, paddingHorizontal: 10, marginTop: 8,
    borderWidth: 1, borderColor: '#c8e6c9'
  },
  chipText: { color: '#1b5e20' },

  tools: { flexDirection: 'row' as const, gap: 8, marginTop: 10 },
  toolBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#e5e7eb' },
  toolText: { color: '#111827', fontWeight: '500' as const },

  sectionTitle: { marginTop: 18, marginBottom: 8, fontWeight: '700' as const },
  histItem: { padding: 10, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, marginBottom: 8 },
  histSmall: { fontSize: 12, color: '#6b7280' },
};

/* ======== API dịch (MyMemory EN->VI giống admin) ======== */
const TRANSLATE_ENDPOINT = 'https://api.mymemory.translated.net/get';
async function translateEnToVi(text: string): Promise<string> {
  if (!text.trim()) return '';
  const url = `${TRANSLATE_ENDPOINT}?q=${encodeURIComponent(text)}&langpair=en|vi`;
  const res = await fetch(url);
  const json = await res.json();
  const raw: string | undefined = json?.responseData?.translatedText;
  return (raw || '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();
}

type Lang = 'en' | 'vi'; // user-screen này bám EN->VI theo admin

export default function TranslateScreen() {
  const router = useRouter();

  /* ======== Trạng thái giống admin ======== */
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [suggesting, setSuggesting] = useState(false);
  const [suggested, setSuggested] = useState('');

  const [enText, setEnText] = useState('');   // giống "word"
  const [viText, setViText] = useState('');   // giống "meaning"

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);


// chuyển đổi từ của hải đang làm có code



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

  async function saveHistory(srcText: string, result: string) {
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, 'translations'), {
        uid: user?.uid || null,
        srcText,
        result,
        srcLang: 'en', tgtLang: 'vi',
        createdAt: serverTimestamp(),
      });
      loadHistory();
    } catch {}
  }

  /* ======== Debounce gợi ý như admin ======== */
  useEffect(() => {
    if (!autoTranslate) return;
    if (!enText.trim()) { setSuggested(''); return; }
    if (viText.trim().length > 0) return; // không đè khi user đã nhập

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSuggesting(true);
      const r = await translateEnToVi(enText.trim());
      setSuggesting(false);
      setSuggested(r || '');
    }, 500);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [enText, autoTranslate, viText]);

  const acceptSuggestion = () => {
    if (suggested) setViText(suggested);
  };

  const handleTranslateManual = async () => {
    if (!enText.trim()) { setViText(''); setSuggested(''); return; }
    const r = await translateEnToVi(enText.trim());
    setViText(r || '');
    setSuggested(r || '');
    saveHistory(enText, r || '');
  };

  /* ======== Tools ======== */
  const copyResult = async () => {
    await setStringAsync(viText || '');
    if (viText) Alert.alert('Đã sao chép', 'Kết quả đã copy vào clipboard.');
  };
  const speak = (text: string, lang: Lang) => {
    const voice = lang === 'vi' ? 'vi-VN' : 'en-US';
    if (!text.trim()) return;
    Speech.stop();
    Speech.speak(text, { language: voice, rate: 1.0, pitch: 1.0 });
  };

  return (
    <SafeAreaView style={S.wrap}>
      <View style={S.container}>
        <Text style={S.title}>🌐 Dịch văn bản (EN → VI)</Text>

        {/* Toggle auto-dịch như admin */}
        <TouchableOpacity
          onPress={() => setAutoTranslate(v => !v)}
          style={[S.toggle, { backgroundColor: autoTranslate ? '#2e7d32' : '#6b7280' }]}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>{autoTranslate ? 'Auto-dịch: BẬT' : 'Auto-dịch: TẮT'}</Text>
        </TouchableOpacity>

        {/* Ô nhập EN */}
        <TextInput
          placeholder="Nhập tiếng Anh..."
          value={enText}
          onChangeText={setEnText}
          multiline
          style={S.box}
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
        />
        <Text style={S.hint}>Gõ tiếng Anh ở đây. Hệ thống gợi ý nghĩa tiếng Việt giống như bên admin.</Text>

        {/* Chip gợi ý giống admin */}
        {autoTranslate && !viText.trim() && suggested ? (
          <TouchableOpacity onPress={acceptSuggestion} style={S.chip}>
            <Text style={S.chipText}>
              {suggesting ? 'Đang gợi ý...' : `Gợi ý: ${suggested} (bấm để dán)`}
            </Text>
          </TouchableOpacity>
        ) : null}

        {/* Ô nghĩa VI (chỉ điền khi bạn bấm chip hoặc bấm Dịch) */}
        <View style={{ marginTop: 12 }}>
          <TextInput
            placeholder="Nghĩa tiếng Việt"
            value={viText}
            onChangeText={setViText}
            multiline
            style={S.box}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Nút hành động (nếu tắt auto, dùng nút Dịch để lấy gợi ý và điền) */}
        <View style={S.btnRow}>
          <TouchableOpacity style={S.btn} onPress={handleTranslateManual}>
            <Text style={S.btnText}>Dịch</Text>
          </TouchableOpacity>
          <TouchableOpacity style={S.btnGrey} onPress={() => { setEnText(''); setViText(''); setSuggested(''); }}>
            <Text style={S.btnText}>Xoá</Text>
          </TouchableOpacity>
        </View>

        {/* Tools */}
        <View style={S.tools}>
          <TouchableOpacity style={S.toolBtn} onPress={copyResult}><Text style={S.toolText}>📋 Copy</Text></TouchableOpacity>
          <TouchableOpacity style={S.toolBtn} onPress={() => speak(enText, 'en')}><Text style={S.toolText}>🔊 Đọc EN</Text></TouchableOpacity>
          <TouchableOpacity style={S.toolBtn} onPress={() => speak(viText, 'vi')}><Text style={S.toolText}>🔊 Đọc VI</Text></TouchableOpacity>
        </View>

        {/* Lịch sử */}
        <Text style={S.sectionTitle}>🕘 Lịch sử gần đây</Text>
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }: any) => (
            <TouchableOpacity
              style={S.histItem}
              onPress={() => { setEnText(item.srcText || ''); setViText(item.result || ''); setSuggested(item.result || ''); }}
            >
              <Text style={S.histSmall}>EN → VI</Text>
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
