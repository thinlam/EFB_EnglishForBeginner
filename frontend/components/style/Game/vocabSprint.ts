import { StyleSheet } from 'react-native';

export const vocabSprintStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    paddingHorizontal: 16, paddingTop: 6, paddingBottom: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  title: { color: '#fff', fontSize: 20, fontWeight: '700' },
  body: { flex: 1, padding: 16, gap: 16 },
  hudRow: {
    marginHorizontal: 16, marginBottom: 8,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  hudPill: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, flexDirection: 'row', gap: 8,
    alignItems: 'center',
  },
  hudText: { color: '#e2e8f0', fontWeight: '600' },
  card: {
    flex: 1, borderRadius: 20, padding: 20, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#111827',
    shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 10 }, shadowRadius: 20,
  },
  word: { fontSize: 28, color: '#fff', fontWeight: '800', marginBottom: 10 },
  meaning: { fontSize: 18, color: '#cbd5e1' },
  tag: {
    marginTop: 12, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999,
    backgroundColor: 'rgba(99,102,241,0.2)',
  },
  tagText: { color: '#a5b4fc', fontSize: 12, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, height: 56, borderRadius: 16, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  btnWrong: { backgroundColor: '#ef4444' },
  btnCorrect: { backgroundColor: '#22c55e' },
  btnLabel: { color: '#fff', fontWeight: '800', fontSize: 16 },
  primary: { marginTop: 12, backgroundColor: '#6366f1', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  primaryLabel: { color: '#fff', fontWeight: '800', fontSize: 16 },
  modalCard: {
    margin: 16, padding: 20, borderRadius: 20, backgroundColor: '#0b1220',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 10 },
  modalText: { color: '#cbd5e1', fontSize: 16, marginBottom: 6 },
  modalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
});
