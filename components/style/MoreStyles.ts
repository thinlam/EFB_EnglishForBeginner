import { StyleSheet } from 'react-native';

export const C = {
  bg: '#FFFFFF',          // nền trắng theo yêu cầu
  card: '#FFFFFF',
  border: '#E5E7EB',      // viền mảnh
  text: '#0B1220',        // chữ nổi bật
  sub: '#4B5563',         // mô tả
  muted: '#9CA3AF',
  primary: '#6C63FF',     // brand EFB
  danger: '#EF4444',
};

export const S = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  headerBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: C.bg,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: C.text,
  },

  content: { paddingHorizontal: 16, paddingBottom: 28 },

  section: { marginTop: 18 },
  sectionTitle: {
    fontSize: 12.5,
    color: C.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
  },

  card: {
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,   // phẳng, không đổ bóng
    overflow: 'hidden',
  },

  row: {
    minHeight: 60,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },
  iconWrap: { width: 34, alignItems: 'center', marginRight: 10 },

  rowTitle: {
    fontSize: 16.5,
    fontWeight: '700',     // đậm hơn để nổi bật
    color: C.text,
  },
  rowSub: {
    fontSize: 13.5,
    color: C.sub,
    marginTop: 3,
  },

  version: {
    textAlign: 'center',
    color: C.muted,
    fontSize: 12.5,
    marginTop: 12,
  },
});
