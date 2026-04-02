import { StyleSheet } from "react-native";

export const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: '#898989ff',
    justifyContent: 'space-between',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    color: '#fefefeff',
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#f9f9f9ff',
    fontSize: 16,
    fontWeight: '700',
  },
  level: { flex: 1, minHeight: 120, borderRadius: 16, backgroundColor: '#0a0a0aff', padding: 12 }, //
  locked: { opacity: 0.6 },
  levelTitle: { color: '#fff', fontWeight: '700' },
  starRow: { flexDirection: 'row', gap: 4, marginTop: 6 },
  lockRow: { flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 6 },
  lockText: { color: '#9ca3af' },
  desc: { color: '#d1d5db', marginTop: 8, fontSize: 12 },
});