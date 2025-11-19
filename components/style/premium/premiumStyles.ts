// components/style/premium/premiumStyles.ts
import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

export const premiumStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfdffff', // slate-900
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },

  /* HEADER */
  headerWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0b0c0cff',
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#121213ff',
  },

  /* HERO CARD */
  heroCard: {
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  heroIcon: {
    fontSize: 26,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  heroText: {
    marginTop: 4,
    fontSize: 13,
    color: '#1F2937',
  },

  /* SECTION TITLE */
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#151618ff',
    marginBottom: 8,
    marginTop: 8,
  },

  /* BENEFITS */
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  benefitIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  benefitText: {
    flex: 1,
    fontSize: 13,
    color: '#111010ff',
  },

  /* PLANS WRAPPER */
  plansContainer: {
    marginTop: 16,
    marginBottom: 16,
  },

  /* PLAN CARD */
  planCard: {
    width: width - 32,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#020617', // slate-950
    borderWidth: 1,
    borderColor: '#1F2937',
    marginBottom: 12,
  },
  planCardSelected: {
    borderColor: '#FACC15',
    backgroundColor: '#111827',
  },

  planHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  planTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F9FAFB',
  },

  badgeWrapper: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#FACC15',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F2937',
  },

  planDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },

  planFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FDE68A',
  },

  /* CTA BUTTON */
  ctaButton: {
    marginTop: 8,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: '#FACC15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  ctaSubText: {
    marginTop: 4,
    fontSize: 11,
    color: '#4B5563',
  },

  /* FOOTER */
  footerText: {
    marginTop: 12,
    fontSize: 12,
    textAlign: 'center',
    color: '#9CA3AF',
  },
  restoreText: {
    marginTop: 4,
    fontSize: 12,
    textAlign: 'center',
    color: '#60A5FA',
    textDecorationLine: 'underline',
  },
});
