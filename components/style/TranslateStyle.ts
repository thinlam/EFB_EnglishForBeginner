// components/style/TranslateStyle.ts
import { StyleSheet } from 'react-native';

export const TranslateStyles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 16 },

  /* Header chọn ngôn ngữ */
  langRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  langBtn: { flex: 1, padding: 8, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, alignItems: 'center' },
  langBtnCol: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  flag: { width: 24, height: 24, resizeMode: 'contain' },
  langText: { fontWeight: '600', fontSize: 14 },
  swapMid: { marginHorizontal: 8, padding: 8, borderRadius: 50, backgroundColor: '#f3f4f6' },
  swapMidIcon: { fontSize: 18, fontWeight: '700', color: '#111827' },

  /* Card */
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    backgroundColor: '#fafafa',
  },
  cardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 6 },

  /* Text input */
  textArea: {
    minHeight: 100,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },
  srcBoxWrap: { position: 'relative' },
  clearBtn: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  clearBtnText: { fontSize: 14, fontWeight: '700', color: '#111827' },

  counterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  counter: { fontSize: 12, color: '#6b7280' },
  counterWarn: { fontSize: 12, color: '#b91c1c', fontWeight: '700' },
  hint: { fontSize: 12, color: '#6b7280' },

  /* Action row trong card */
  actionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  iconRowRight: { flexDirection: 'row', gap: 10 },
  iconBtn: { padding: 8, borderRadius: 8, backgroundColor: '#f3f4f6' },

  /* Chips từng từ */
  wordChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: {
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  chipText: { color: '#1b5e20' },

  /* IPA panel */
  pronHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pronWord: { fontWeight: '700', fontSize: 16 },
  pronSpeak: { fontWeight: '600', color: '#2563eb' },
  pronIPA: { fontSize: 16, color: '#374151' },
  pronHint: { color: '#6b7280', marginTop: 6 },

  /* Tools & History */
  sectionTitle: { marginTop: 18, marginBottom: 8, fontWeight: '700' },
  histItem: { padding: 10, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, marginBottom: 8 },
  histSmall: { fontSize: 12, color: '#6b7280' },
});