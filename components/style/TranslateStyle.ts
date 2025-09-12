import { StyleSheet } from 'react-native';

export const TranslateStyles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#fff' },

  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },

  row: { flexDirection: 'row', alignItems: 'center' },
  toggle: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, marginBottom: 8 },

  box: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    textAlignVertical: 'top',
    fontSize: 16,
    backgroundColor: '#fff',
  },
  hint: { fontSize: 12, color: '#6b7280', marginTop: 6, marginBottom: 8 },

  btnRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#2563eb',
  },
  btnGrey: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#6b7280',
  },
  btnText: { color: '#fff', fontWeight: '600' },

  chip: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  chipText: { color: '#1b5e20' },

  tools: { flexDirection: 'row', gap: 8, marginTop: 10 },
  toolBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#e5e7eb' },
  toolText: { color: '#111827', fontWeight: '500' },

  sectionTitle: { marginTop: 18, marginBottom: 8, fontWeight: '700' },
  histItem: { padding: 10, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, marginBottom: 8 },
  histSmall: { fontSize: 12, color: '#6b7280' },

  swapBtn: { marginLeft: 'auto', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#fef3c7' },
  counterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  counter: { fontSize: 12, color: '#6b7280' },
  counterWarn: { fontSize: 12, color: '#b91c1c', fontWeight: '700' },
});
