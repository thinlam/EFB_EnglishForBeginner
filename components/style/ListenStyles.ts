import { StyleSheet } from 'react-native';

export const COLORS = {
  bg: '#0b1220',
  text: '#ffffff',
  subText: '#aaa',
  muted: '#9ca3af',
  border: 'rgba(255,255,255,0.1)',
  borderSoft: 'rgba(255,255,255,0.05)',
  seed: '#a78bfa',
  create: '#4ade80',
  edit: '#60a5fa',
  del: '#f87171',
};

export const ListenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seedIconWrap: { marginRight: 12 },

  /* Loading */
  loading: { marginTop: 40 },

  /* Empty state */
  emptyWrap: { padding: 24 },
  emptyText: { color: COLORS.muted },
  emptyTextEm: { fontWeight: '700', color: COLORS.seed },
  emptyTextPlus: { fontWeight: '700', color: COLORS.create },

  /* Item */
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSoft,
  },
  itemTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  itemDate: { fontSize: 12, color: COLORS.subText, marginTop: 2 },
  itemMeta: { fontSize: 12, color: COLORS.muted, marginTop: 6 },
  itemMeta2: { fontSize: 12, color: COLORS.muted, marginTop: 4 },
  itemActions: { flexDirection: 'row', marginTop: 10 },
  itemEditBtn: { marginRight: 16 },
});
