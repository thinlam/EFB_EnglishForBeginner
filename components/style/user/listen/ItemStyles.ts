// components/style/user/listen/ItemStyles.ts
import { StyleSheet } from 'react-native'

/* ===== COLORS ===== */
const COLORS = {
  bgScreen: '#0b1220',

  cardBg: '#0f172a',
  cardBorder: '#1f2937',

  textPrimary: '#e5e7eb',
  textMuted: '#94a3b8',
  textSoft: '#cbd5e1',

  choiceBg: '#111827',
  choiceBorder: '#374151',

  choiceCorrectBg: '#065f46',
  choiceCorrectBorder: '#10b98155',
  choiceCorrectText: '#86efac',

  choiceWrongBg: '#7f1d1d',
  choiceWrongBorder: '#ef444455',
  choiceWrongText: '#fca5a5',
}

export const ItemStyles = StyleSheet.create({
  /* Screen */
  safeWrapDark: {
    flex: 1,
    backgroundColor: COLORS.bgScreen,
  },

  /* Header */
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#11182744',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerTitleText: { color: COLORS.textPrimary },

  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Scroll */
  scrollContent: {
    padding: 16,
    gap: 16,
  },

  /* Media card */
  mediaCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  mediaCardHeader: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  mediaCardHeaderText: {
    color: COLORS.textSoft,
    fontWeight: '700',
  },

  mediaPlayerVideo: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  mediaPlayerAudio: {
    width: '100%',
    height: 64,
    backgroundColor: '#000',
  },
  videoView: {
    width: '100%',
    height: '100%',
  },
  noMediaCard: {
    padding: 16,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  noMediaText: {
    color: COLORS.textMuted,
  },

  /* Transcript */
  transcriptCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },

  transcriptHeader: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  transcriptHeaderTitle: {
    color: COLORS.textSoft,
    fontWeight: '700',
  },

  transcriptToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#111827',
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  transcriptText: {
    padding: 16,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },

  /* Quiz root */
  quizCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 16,
  },

  quizHeaderTitle: {
    color: COLORS.textSoft,
    fontWeight: '700',
    fontSize: 17,
    marginBottom: 12,
  },

  /* Quiz item block */
  quizItem: {
    padding: 14,
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },

  quizItemTitle: {
    color: COLORS.textSoft,
    fontWeight: '700',
    marginBottom: 6,
  },

  quizItemText: {
    color: COLORS.textPrimary,
    lineHeight: 20,
  },

  /* MCQ options */
  choiceBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.choiceBg,
    borderWidth: 1,
    borderColor: COLORS.choiceBorder,
    marginTop: 8,
  },

  choiceText: {
    color: COLORS.textPrimary,
  },

  choiceSelected: {
    backgroundColor: '#1e293b',
    borderColor: '#3b82f6',
  },

  choiceCorrect: {
    backgroundColor: COLORS.choiceCorrectBg,
    borderColor: COLORS.choiceCorrectBorder,
  },

  choiceWrong: {
    backgroundColor: COLORS.choiceWrongBg,
    borderColor: COLORS.choiceWrongBorder,
  },

  /* Submit button */
  checkBtn: {
    backgroundColor: '#4f46e5',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },

  checkBtnText: {
    color: '#fff',
    fontWeight: '700',
  },

  /* Result text */
  quizResult: {
    marginTop: 10,
    fontWeight: '700',
    fontSize: 15,
  },

  quizResultCorrect: {
    color: COLORS.choiceCorrectText,
  },

  quizResultWrong: {
    color: COLORS.choiceWrongText,
  },

  /* segment text */
  quizSegmentText: {
    marginTop: 10,
    color: '#fcd34d',
    fontStyle: 'italic',
  },
})
