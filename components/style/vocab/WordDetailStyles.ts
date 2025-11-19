// components/style/vocab/WordDetailStyles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Safe area cho iOS tai thỏ + Android giọt nước
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // padding dưới để tránh gesture bar
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ---------- Header ----------
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

  // ---------- Từ chính + phiên âm ----------
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

  // ---------- Block theo từng POS (entry) ----------
  entryBlock: {
    marginTop: 20,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },

  entryPOS: {
    fontSize: 15,
    fontWeight: '700',
    color: '#7C3AED', // tím kiểu từ điển
    marginBottom: 4,
    textTransform: 'capitalize',
  },

  // Verb forms: V1 V2 V3...
  formsLine: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 6,
  },

  formsLabel: {
    fontWeight: '700',
    color: '#1D4ED8',
  },

  // ---------- Nghĩa ----------
  meaningItem: {
    marginTop: 8,
  },

  meaningDefinition: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },

  exampleEn: {
    marginTop: 4,
    fontSize: 14,
    fontStyle: 'italic',
    color: '#374151',
  },

  exampleVi: {
    marginTop: 2,
    fontSize: 14,
    color: '#6B7280',
  },

  // ---------- Thành ngữ / idioms ----------
  idiomBlock: {
    marginTop: 16,
  },

  idiomTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },

  idiomItem: {
    marginBottom: 10,
  },

  idiomPhrase: {
    fontSize: 15,
    color: '#2563EB',
    fontWeight: '600',
  },

  idiomMeaning: {
    fontSize: 14,
    color: '#111827',
    marginTop: 2,
  },

  // ---------- Các style cũ (giữ lại nếu chỗ khác còn dùng) ----------

  // Dòng "động từ ate, eaten" kiểu Lạc Việt (nếu sau này dùng lại)
  posLine: {
    marginTop: 8,
    fontSize: 14,
    color: '#111827',
  },
  posLineMain: {
    fontWeight: '600',
  },
  posLineLink: {
    textDecorationLine: 'underline',
    color: '#1D4ED8',
  },

  posPill: {
    marginTop: 10,
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

  // nếu còn màn nào xài meaningsBlock/singleMeaning/exampleBlock thì vẫn ok
  meaningsBlock: {
    marginTop: 16,
  },

  singleMeaning: {
    marginTop: 16,
    fontSize: 18,
    color: '#111827',
    fontWeight: '600',
  },

  exampleBlock: {
    marginTop: 16,
  },

  // mấy cái dưới không dùng trong WordDetailScreen mới, nhưng giữ để khỏi vỡ chỗ khác
  meaningIndex: {
    width: 20,
    fontSize: 14,
    color: '#111827',
    marginTop: 2,
  },

  meaningBody: {
    flex: 1,
  },

  meaningExampleEn: {
    marginTop: 4,
    fontSize: 14,
    fontStyle: 'italic',
    color: '#374151',
  },

  meaningExampleVi: {
    marginTop: 2,
    fontSize: 14,
    color: '#6B7280',
  },

  verbFormsBlock: {
    marginTop: 20,
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
