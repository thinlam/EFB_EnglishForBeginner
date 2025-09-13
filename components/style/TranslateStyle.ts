import { StyleSheet } from 'react-native';

export const TranslateStyles = StyleSheet.create({
  /* Khung nền */
  wrap: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 16 },

  /* Hàng chọn ngôn ngữ + swap */
  langRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  langBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  langText: { fontSize: 16, fontWeight: '700', color: '#111827' },
  langSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  swapMid: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  swapMidIcon: { fontSize: 20 },

  /* CARD chung */
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  cardTitle: { fontSize: 12, color: '#6b7280', marginBottom: 6 },

  /* TextArea + clear X */
  srcBoxWrap: { position: 'relative' },
  textArea: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    paddingRight: 36,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff',
  },
  clearBtn: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  clearBtnText: { fontSize: 14, color: '#374151' },

  /* Counter nhỏ gọn */
  counterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  hint: { fontSize: 12, color: '#6b7280' },
  counter: { fontSize: 12, color: '#6b7280' },
  counterWarn: { fontSize: 12, color: '#b91c1c', fontWeight: '700' },

  /* Hàng hành động dưới mỗi thẻ */
  actionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },

  /* Nút Translate */
  translateBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  translateBtnText: { color: '#fff', fontWeight: '700' },

  /* Cụm icon phải: copy/speaker xám, mic xanh tròn */
  iconRowRight: { flexDirection: 'row', gap: 10, marginLeft: 'auto' },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e5e7eb', // xám nhạt
  },
  iconBtnMic: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb', // xanh lam nổi bật (giống ảnh)
  },
  iconBtnMicOn: {
    backgroundColor: '#1d4ed8', // đậm hơn khi đang ghi
  },

  /* Chips từ */
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 4,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  chipText: { color: '#1b5e20' },
  wordChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },

  /* Lịch sử */
  sectionTitle: { marginTop: 10, marginBottom: 8, fontWeight: '700' },
  histItem: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    marginBottom: 8,
  },
  histSmall: { fontSize: 12, color: '#6b7280' },

  /* Panel phát âm */
  pronHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pronWord: { fontWeight: '700', fontSize: 16 },
  pronSpeak: { fontWeight: '600' },
  pronIPA: { fontSize: 16, color: '#374151' },
  pronHint: { marginTop: 6, color: '#6b7280' },
});
