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
    paddingTop: 8,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  headerTextBlock: {
    marginLeft: 12,
    flexShrink: 1,
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

  /* Avatar */
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4B5563',
  },
  avatarPremiumRing: {
    padding: 2,
    borderRadius: 999,
  },

  /* PREMIUM badge */
  premiumBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.6,
  },

  /* CEFR pill + nước */
  headerLevelPill: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    overflow: 'hidden',
  },

  levelWaterContainer: {
    flex: 1,
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },

  levelWaterFill: {
    position: 'absolute',
    left: -20,
    right: -20,
    bottom: -5,
    backgroundColor: '#BFDBFE',
    opacity: 0.85,
    borderRadius: 32,
  },

  levelTextWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerLevelLabel: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '600',
  },
  headerLevelText: {
    color: '#0B1220',
    fontSize: 16,
    fontWeight: '800',
  },

  /* CARD LIST */
  card: {
    width: CARD_WIDTH,
    height: 140,
    borderRadius: 18,
    marginBottom: 16,
    overflow: 'hidden',
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
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  subtitle: {
    color: '#F9FAFB',
    fontSize: 11,
    fontWeight: '500',
  },

  topics: {
    color: '#E5E7EB',
    fontSize: 11,
    fontWeight: '500',
  },

  title: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '800',
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
    backgroundColor: 'rgba(15,23,42,0.25)',
  },

  levelChipActive: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },

  levelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E5E7EB',
  },

  levelTextActive: {
    color: '#111827',
  },
});
