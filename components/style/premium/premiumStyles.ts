// components/style/premium/premiumStyles.ts
import { StyleSheet } from 'react-native';

export const premiumStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  headerWrapper: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#6B7280',
  },
  heroCard: {
    borderRadius: 20,
    padding: 24,
    marginTop: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  heroIcon: {
    fontSize: 40,
    textAlign: 'center',
  },
  heroTitle: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  heroText: {
    marginTop: 6,
    fontSize: 14,
    color: '#1F2933',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  benefitIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  plansContainer: {
    marginTop: 18,
  },
  ctaButton: {
    marginTop: 26,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  ctaSubText: {
    marginTop: 4,
    fontSize: 12,
    color: '#FEF3C7',
  },
  footerText: {
    marginTop: 18,
    fontSize: 12,
    textAlign: 'center',
    color: '#6B7280',
  },
  restoreText: {
    marginTop: 8,
    fontSize: 13,
    textAlign: 'center',
    color: '#2563EB',
  },
});
