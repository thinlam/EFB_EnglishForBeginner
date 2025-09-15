import { StyleSheet } from 'react-native';

export const COLORS = {
  bg: '#0b1220',
  card: '#111827',
  card2: '#0f172a',
  text: '#ffffff',
  subText: '#cbd5e1',
  muted: '#9ca3af',
  border: 'rgba(255,255,255,0.1)',
  borderSoft: 'rgba(255,255,255,0.06)',
  seed: '#a78bfa',
  create: '#4ade80',
  edit: '#60a5fa',
  del: '#f87171',
  link: '#93c5fd',
  badgeAudio: '#22d3ee',
  badgeVideo: '#fbbf24',
};

export const ListenStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  /* Header với nút Back + tiêu đề căn giữa */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    padding: 6,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },

  /* Search + Filter row */
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    zIndex: 20,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 14, paddingVertical: 0 },

  // Picker container (custom overlay)
  filterPicker: {
    position: 'relative',
    width: 120,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.card2,
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 12,
    overflow: 'visible',
    zIndex: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  filterValueText: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  filterChevron: {
    position: 'absolute',
    right: 8,
    top: 0,
    bottom: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  hiddenPicker: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0.01,
    backgroundColor: 'transparent',
  },

  /* Empty state */
  emptyWrap: { padding: 24, alignItems: 'center' },
  emptyTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 6 },
  emptyText: { color: COLORS.muted, textAlign: 'center' },
  emptyEm: { color: COLORS.create, fontWeight: '700' },

  /* Card item */
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardTitle: { flex: 1, color: COLORS.text, fontSize: 16, fontWeight: '700' },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  badgeText: { color: '#0b1220', fontWeight: '800', fontSize: 12 },
  badgeAudio: { backgroundColor: COLORS.badgeAudio },
  badgeVideo: { backgroundColor: COLORS.badgeVideo },

  cardMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  cardDate: { color: COLORS.subText, fontSize: 12 },

  // Hàng icon – text
  rowLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  rowText: { color: COLORS.subText, fontSize: 12 },
  rowTextLink: {
    color: COLORS.link,
    fontSize: 13,
    textDecorationLine: 'underline',
  },

  cardLink: { color: COLORS.link, textDecorationLine: 'underline', fontSize: 13, marginTop: 10 },
  cardTranscript: { color: COLORS.muted, fontSize: 13, flex: 1 },

  cardActions: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 12 },
  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0b1220',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  iconBtnText: { color: COLORS.text, fontWeight: '600', fontSize: 13 },

  /* FAB */
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.create,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
