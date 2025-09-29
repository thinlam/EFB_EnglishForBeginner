import { StyleSheet } from 'react-native'

/* 🎨 Bảng màu chia nhóm rõ ràng */
const COLORS = {
  bg: '#fff',
  card: '#111827',
  text: '#111827',
  textLight: '#374151',
  subText: '#6b7280',
  border: '#e5e7eb',
  grayBg: '#f3f4f6',
  grayLight: '#f9fafb',
  muted: '#d1d5db',
}

export const ListenStyles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: COLORS.bg },
  container: { paddingHorizontal: 16, paddingBottom: 28, gap: 14 },

  /* Search */
  searchWrap: {
    marginTop: 6,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.grayLight,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text },

  /* Header */
  headerRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grayBg,
  },
  title: { fontSize: 16, fontWeight: '800', color: COLORS.text },

  /* Card */
  card: {
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  startBtn: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.grayBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnText: { fontSize: 14, color: COLORS.textLight, fontWeight: '600' },

  /* Pagination */
  pagingRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pageBtn: {
    height: 36,
    width: 44,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageBtnDisabled: { backgroundColor: COLORS.muted },
  pageBtnText: { color: COLORS.bg, fontWeight: '700' },

  pageNumbers: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  pageDot: {
    minWidth: 36,
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bg,
  },
  pageDotActive: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.card,
  },
  pageDotText: { color: COLORS.card, fontWeight: '700' },
  /* ✅ Thêm style chữ active để tương phản trên nền tối */
  pageDotTextActive: { color: COLORS.bg },

  ellipsis: { marginHorizontal: 4, color: COLORS.subText, fontWeight: '700' },
})
