import { StyleSheet } from 'react-native';

export const BRAND = {
  primary: '#6C63FF', // tím EFB
  success: '#77B66E',
  heart: '#FF5D73',
  bg: '#F6F7FB',
  text: '#0B1220',
  sub: '#6B7280',
  card: '#FFFFFF',
  border: '#E5E7EB',
};

export const S = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: BRAND.bg },
  center: { justifyContent: 'center', alignItems: 'center' },

  header: {
    paddingTop: 28,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 64, height: 64, borderRadius: 32, marginRight: 12, backgroundColor: '#fff' },
  name: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 6 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },

  levelBadge: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 6, paddingHorizontal: 10, borderRadius: 20, backgroundColor: '#FFFFFF',
  },
  levelText: { color: BRAND.primary, fontWeight: '700', fontSize: 12 },

  progressWrap: { marginTop: 16, backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 12, padding: 12 },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressTitle: { color: '#fff', fontWeight: '700' },
  progressPct: { color: '#fff', fontWeight: '800' },
  progressBar: { height: 10, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.35)', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#FFFFFF' },
  progressSub: { color: '#EEF', fontSize: 12, marginTop: 6 },

  section: { paddingHorizontal: 16, paddingTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: BRAND.text },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  link: { color: BRAND.primary, fontWeight: '700' },

  statsRow: { flexDirection: 'row', gap: 10 },
  statChip: {
    flex: 1, backgroundColor: BRAND.card, borderRadius: 14, padding: 12, alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth, borderColor: BRAND.border,
  },
  statIcon: {
    width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  statVal: { fontSize: 18, fontWeight: '800', color: BRAND.text },
  statLabel: { fontSize: 12, color: BRAND.sub, marginTop: 2 },

  card: {
    backgroundColor: BRAND.card, borderRadius: 14, padding: 14,
    borderWidth: StyleSheet.hairlineWidth, borderColor: BRAND.border,
  },
  premiumRow: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '800', color: BRAND.text },
  cardSub: { fontSize: 12, color: BRAND.sub, marginTop: 2 },
  btn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, marginLeft: 10 },
  btnText: { color: '#fff', fontWeight: '800' },

  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10 },
  badgeItem: { width: '22.5%', alignItems: 'center' },
  badgeIconWrap: {
    width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', borderWidth: StyleSheet.hairlineWidth, borderColor: BRAND.border,
  },
  badgeName: { fontSize: 11, marginTop: 6, color: BRAND.text, fontWeight: '600' },
  lockText: { fontSize: 10, color: BRAND.sub },

  cardList: {
    backgroundColor: BRAND.card, borderRadius: 14, overflow: 'hidden',
    borderColor: BRAND.border, borderWidth: StyleSheet.hairlineWidth,
  },
  listItem: {
    paddingVertical: 14, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: BRAND.border,
  },
  listIconWrap: {
    width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#EEF0FF', marginRight: 10,
  },
  listTitle: { flex: 1, color: BRAND.text, fontWeight: '600' },

  emptyTitle: { fontSize: 18, fontWeight: '800', color: BRAND.text, marginTop: 12 },
  emptySub: { color: BRAND.sub, marginTop: 6 },
});
