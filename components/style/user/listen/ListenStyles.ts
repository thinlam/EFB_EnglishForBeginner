import { COLORS } from '@/components/style/colors/AppColors';
import { Platform, StyleSheet } from 'react-native';

export const ListenStyles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: COLORS.bgScreen,
  },

  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.bgScreen,
    position: 'relative',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.5,
  },

  /* ================= LEVEL BUTTON ================= */
  levelSelectBtn: {
    flexDirection: 'row',          // A1 + icon nằm ngang
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,

    width: 96,                     // ✅ BẰNG dropdown
    height: 48,                    // ✅ BẰNG levelOption
    borderRadius: 14,

    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  levelSelectText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 16,
    marginTop: Platform.OS === 'web' ? 1 : 0,
  },

  /* ================= DROPDOWN ================= */
  levelDropdown: {
    position: 'absolute',
    top: 56,
    right: 16,

    width: 96,
    paddingVertical: 8,

    backgroundColor: COLORS.bg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,

    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,

    zIndex: 100,
  },

  levelOption: {
    height: 48,                    // ✅ cùng size với nút A1
    alignItems: 'center',
    justifyContent: 'center',
  },

  levelOptionActive: {
    backgroundColor: COLORS.text,
  },

  levelOptionLocked: {
    backgroundColor: COLORS.card2,
  },

  levelOptionText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMuted,
  },

  levelOptionTextActive: {
    color: COLORS.bg,
  },

  levelOptionTextLocked: {
    color: COLORS.textSoft,
  },

  /* ================= SEARCH ================= */
  searchWrap: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },

  loading: {
    padding: 24,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
    maxWidth: 720,
    alignSelf: 'center',
    width: '100%',
  },

  /* ================= CARD ================= */
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },

  cardPressed: {
    opacity: 0.96,
  },

  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  cardThumb: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: COLORS.card2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardContent: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },

  cardSubtitle: {
    fontSize: 13,
    color: COLORS.subText,
    marginTop: 2,
  },

  cardMetaRow: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 8,
  },

  cardLevelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },

  cardLevelText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
});
