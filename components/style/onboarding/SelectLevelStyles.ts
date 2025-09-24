import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 40,
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
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  optionCardSelected: {
    backgroundColor: '#e0f2fe',
    borderColor: '#3b82f6',
  },
  optionLabel: {
    fontSize: 15,
    color: '#1f2937',
    marginTop: 8,
  },
  starContainer: {
    flexDirection: 'row',
  },
  feedbackBox: {
    marginTop: 20,
    alignItems: 'center',
  },
  feedbackText: {
    fontStyle: 'italic',
    fontSize: 14,
    color: '#2563eb',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    textTransform: 'uppercase',
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backButtonText: {
    color: '#1D4ED8',
    fontSize: 14,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});
