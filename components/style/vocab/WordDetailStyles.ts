// components/style/vocab/WordDetailStyles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
  },

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

  word: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },

  phoneticRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    marginTop: 6,
  },

  phonetic: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#4B5563',
  },

  posPill: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },

  posText: {
    fontSize: 13,
    color: '#4338CA',
    fontWeight: '600',
  },

  meaning: {
    marginTop: 16,
    fontSize: 18,
    color: '#111827',
    fontWeight: '600',
  },

  exampleBlock: {
    marginTop: 16,
  },

  exampleEn: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#374151',
  },

  exampleVi: {
    marginTop: 6,
    fontSize: 14,
    color: '#6B7280',
  },

  /** -------- Verb forms block (V1, V2, V3...) -------- */

  verbFormsBlock: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  verbFormsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },

  verbFormsLine: {
    fontSize: 13,
    color: '#374151',
    marginTop: 2,
  },

  verbFormsLabel: {
    fontWeight: '600',
    color: '#111827',
  },
});
