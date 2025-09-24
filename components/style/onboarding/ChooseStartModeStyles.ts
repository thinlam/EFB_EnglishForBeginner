import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 36,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  optionCardSelected: {
    backgroundColor: '#e0f2fe',
    borderColor: '#3b82f6',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 36,
    height: 36,
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  optionDesc: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  continueButton: {
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 12,
    marginBottom: 20,
  },
  continueText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
