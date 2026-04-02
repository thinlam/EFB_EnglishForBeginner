// components/style/grammar/GrammarDetailStyles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    columnGap: 12,
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  levelTag: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    color: '#6B7280',
    marginBottom: 4,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },

  // Pattern
  patternBlock: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    marginBottom: 16,
  },

  patternLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 4,
  },

  patternText: {
    fontSize: 15,
    color: '#111827',
  },

  // Explain
  explainBlock: {
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },

  explainText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },

  // Examples
  exampleBlock: {
    marginTop: 4,
  },

  exampleEn: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#1F2937',
  },

  exampleVi: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 2,
  },
});
