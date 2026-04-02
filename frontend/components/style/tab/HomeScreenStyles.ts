// components/style/tab/HomeScreenStyles.ts
import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
export const CARD_WIDTH = width / 2 - 24;

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  /* HEADER */
  header: {
    paddingHorizontal: 16,
    paddingTop: 4, // sát hơn với notch iOS / Android
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerTextBlock: {
    flex: 1,
    marginLeft: 12,
  },

  hello: {
    color: '#0B1220',
    fontSize: 18,
    fontWeight: '500',
  },
  helloBold: {
    fontWeight: '800',
  },
  subHello: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },

  /* Avatar + PREMIUM */

  avatarWrapper: {
    alignItems: 'center',
    marginRight: 12,
  },

  avatarPremiumRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },

  premiumChip: {
  position: 'absolute',
  bottom: -12,
  alignSelf: 'center',
  paddingHorizontal: 8,
  paddingVertical: 2,
  borderRadius: 999,
  borderWidth: 1.5,
  borderColor: '#FFFFFF',
},

premiumChipText: {
  fontSize: 8,
  fontWeight: '700',
  color: '#FFFFFF',
  letterSpacing: 0.3,
},


  /* CARD GRID */

  card: {
    width: CARD_WIDTH,
    height: 140,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#F3F4F6',
    // shadow iOS
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    // elevation Android
    elevation: 3,
  },

  gradientBg: {
    flex: 1,
    padding: 12,
    borderRadius: 18,
  },

  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  iconBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  subtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
  },

  topics: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
  },

  title: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  levelRow: {
    marginTop: 10,
    flexDirection: 'row',
  },

  levelChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },

  levelChipActive: {
    backgroundColor: 'rgba(255,255,255,0.96)',
  },

  levelText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },

  levelTextActive: {
    color: '#111827',
  },
    // CEFR pill
  cefrContainer: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  cefrBg: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: 'center',
  },
  cefrLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  cefrLevel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  cefrProgressTrack: {
    marginTop: 6,
    width: 52,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    overflow: 'hidden',
  },
  cefrProgressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#38BDF8',
  },

});
