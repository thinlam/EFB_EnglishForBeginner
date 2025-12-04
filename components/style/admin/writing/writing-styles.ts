import { COLORS } from '@/components/style/colors/AppColors';
import { StyleSheet } from 'react-native';

export const WritingScreenStyles = StyleSheet.create({
  /* ===== LAYOUT ===== */
  container: {
    flex: 1,
    backgroundColor: COLORS.bgScreen,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },

  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    marginRight: 10,
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },

  /* ===== LIST FILTER ===== */
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },

  filterPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'space-between',
  },

  filterValueText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },

  filterChevron: {
    marginLeft: 8,
  },

  /* ===== CARD ===== */
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginBottom: 14,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  rowLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rowLabel: {
    marginLeft: 6,
    fontSize: 13,
    color: COLORS.textMuted,
  },

  rowText: {
    marginLeft: 4,
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },

  rowTextLink: {
    marginLeft: 4,
    fontSize: 13,
    color: COLORS.link,
    fontWeight: '500',
  },

  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },

  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  iconBtnText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },

  /* ===== BADGE ===== */
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },

  badgeText: {
    fontSize: 12,
    color: COLORS.bg,
    fontWeight: '700',
  },

  /* ===== EMPTY ===== */
  emptyWrap: {
    alignItems: 'center',
    marginTop: 40,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },

  emptyEm: {
    fontSize: 15,
    color: COLORS.create,
    fontWeight: '700',
  },

  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },

  /* ===== FAB BUTTON ===== */
  fab: {
    position: 'absolute',
    right: 20,
    width: 55,
    height: 55,
    borderRadius: 999,
    backgroundColor: COLORS.create,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },

  /* ===== MODALS ===== */
  overlayDim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  levelDialog: {
    width: '80%',
    borderRadius: 16,
    padding: 16,
    backgroundColor: COLORS.card,
  },

  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  levelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },

  levelItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },

  levelItemText: {
    fontSize: 14,
    color: COLORS.text,
  },

  levelItemTextSelected: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.create,
  },
});
