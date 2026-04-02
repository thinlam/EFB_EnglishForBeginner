import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_W = (width - CARD_GAP * 3) / 2;

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfdffff' },

 header: { 
  flexDirection: 'row', 
  alignItems: 'center', 
  paddingHorizontal: 16, 
  paddingTop: 8, 
  paddingBottom: 12 
},
  headerTitle: { color: '#050505ff', fontSize: 24, fontWeight: '700' },
  headerCaption: { color: '#A8B0C2', marginTop: 4, fontSize: 13 },

  listContent: { paddingHorizontal: 12, paddingBottom: 24 },

  card: {
    width: CARD_W,
    height: 140,
    borderRadius: 18,
    overflow: 'hidden',
    padding: 12,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },

  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cardSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },

  pillRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pill: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillText: { color: '#fff', fontSize: 11, fontWeight: '600', letterSpacing: 0.2 },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    zIndex: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});
