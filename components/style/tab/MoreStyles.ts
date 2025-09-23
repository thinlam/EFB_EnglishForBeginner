import { StyleSheet } from 'react-native';

export const C = {
  primary: '#2563EB',
  muted: '#9CA3AF',
  card: '#FFFFFF',
  bg: '#F9FAFB',
  border: '#E5E7EB',
  title: '#0B1220',
  danger: '#DC2626',
};

export const S = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  headerBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: C.bg,
  },
  screenTitle: { fontSize: 20, fontWeight: '800', color: C.title },

  content: { padding: 16, paddingBottom: 32 },

  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: C.muted, marginBottom: 8 },

  card: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },

  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
  },

  rowTitle: { fontSize: 15, fontWeight: '700', color: C.title },
  rowSub: { fontSize: 12, color: C.muted, marginTop: 2 },

  version: {
    textAlign: 'center',
    marginTop: 16,
    color: C.muted,
    fontSize: 12,
  },
});
