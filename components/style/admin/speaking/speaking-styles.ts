// components/style/admin/speaking/speaking-styles.ts
import { StyleSheet } from 'react-native';
import { COLORS } from '../AdminColors';

export const SpeakingStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  backBtn: {
    width: 42,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },

  filterRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 14, paddingVertical: 6 },

  filterPicker: {
    height: 40,
    minWidth: 88,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  filterValueText: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  filterChevron: { marginLeft: 6 },

  card: {
    marginHorizontal: 12,
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },

  rowLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  rowLabel: { color: COLORS.subText, fontSize: 13 },
  rowText: { color: COLORS.text, fontSize: 13 },
  rowTextLink: {
    color: COLORS.link,
    fontSize: 13,
    textDecorationLine: 'underline',
  },

  cardTitle: { color: COLORS.text, fontSize: 15, fontWeight: '700', flexShrink: 1 },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#0b0f15',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.3,
  },

  cardActions: { marginTop: 12, flexDirection: 'row', gap: 10 },
  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  iconBtnText: { color: COLORS.text, fontSize: 13, fontWeight: '600' },

  emptyWrap: { alignItems: 'center', marginTop: 48, paddingHorizontal: 16 },
  emptyTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 6 },
  emptyText: { color: COLORS.subText, fontSize: 14, textAlign: 'center' },
  emptyEm: { color: COLORS.create, fontWeight: '900' },

  fab: {
    position: 'absolute',
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.create,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});
