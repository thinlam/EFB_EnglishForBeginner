import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
export const CARD_WIDTH = width / 2 - 24;

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  hello: { color: '#0B1220', fontSize: 18, fontWeight: '500' },
  helloBold: { fontWeight: '800' },
  subHello: { color: '#6B7280', fontSize: 12, marginTop: 2 },

  headerLevelPill: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
  },
  headerLevelLabel: { color: '#6B7280', fontSize: 10, fontWeight: '600', marginBottom: 2 },
  headerLevelText: { color: '#111827', fontWeight: '800', fontSize: 16 },

  card: {
    width: CARD_WIDTH,
    height: 140,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  gradientBg: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
  },

  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  iconBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
  },

  title: { fontSize: 18, fontWeight: '900', color: '#fff', marginTop: 10 },

  topics: { fontSize: 14, color: '#F9FAFB', fontWeight: '600' },
  subtitle: {
    fontSize: 14,
    color: '#F9FAFB',
    fontStyle: 'italic',
    fontWeight: '500',
    maxWidth: CARD_WIDTH - 80,
  },

  levelRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  levelChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginRight: 6,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  levelChipActive: { backgroundColor: '#fff' },
  levelText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  levelTextActive: { color: '#0B1220' },
});
