import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  container: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // ---------- TAB ----------
  tabWrap: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 4,
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 12,
  },

  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },

  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },

  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },

  tabTextActive: {
    color: '#111827',
    fontWeight: '700',
  },

  // ---------- Header ----------
  header: {
    marginTop: 6,
    marginBottom: 16,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },

  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },

  // ---------- Topic Card ----------
  topicCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },

  topicCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  topicCardSub: {
    fontSize: 14,
    color: '#6B7280',
  },

  // ---------- Word Card ----------
  wordCard: {
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 10,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },

  wordLeft: {
    flexDirection: 'column',
  },

  wordText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  wordPhonetic: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },

  // ---------- Back Button ----------
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    columnGap: 6,
  },

  backBtnText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },

  // ---------- Grammar Placeholder ----------
  grammarBlock: {
    marginTop: 20,
  },

  grammarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },

  grammarDesc: {
    marginTop: 8,
    fontSize: 15,
    color: '#6B7280',
  },
    // ---------- GRAMMAR CARD ----------
  grammarCard: {
    padding: 18,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',

    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 1,
  },

  grammarTag: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
  },

  grammarPattern: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D4ED8',
    marginBottom: 6,
  },

  grammarSummary: {
    fontSize: 14,
    color: '#4B5563',
  },

  grammarExampleBlock: {
    marginTop: 8,
  },

  grammarExampleEn: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#374151',
  },

  grammarExampleVi: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },

});
