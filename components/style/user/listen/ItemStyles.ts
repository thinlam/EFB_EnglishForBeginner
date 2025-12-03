// components/style/user/listen/ItemStyles.ts
<<<<<<< HEAD
import { StyleSheet } from 'react-native';

/* Bảng màu riêng cho màn Listen Item */
=======
import { StyleSheet } from 'react-native'

/* ===== COLORS ===== */
>>>>>>> 253bdbd98d032668c29675d1b9e5a08adf107f07
const COLORS = {
  bgScreen: '#0b1220',

  cardBg: '#0f172a',
  cardBorder: '#1f2937',

  textPrimary: '#e5e7eb',
  textMuted: '#94a3b8',
  textSoft: '#cbd5e1',
<<<<<<< HEAD
  textDanger: '#fca5a5',
  textDangerSoft: '#fca5a5aa',

  pillLevelBg: '#60a5fa22',
  pillLevelBorder: '#60a5fa55',
  pillLevelText: '#93c5fd',

  pillDurationBg: '#22c55e22',
  pillDurationBorder: '#22c55e55',
  pillDurationText: '#86efac',

  pillHlsBg: '#f59e0b22',
  pillHlsBorder: '#f59e0b55',
  pillHlsText: '#fcd34d',

  quizIcon: '#60a5fa',
  transcriptIcon: '#a5b4fc',

  btnDarkBg: '#11182733',

  toggleBg: '#111827',
  toggleText: '#d1d5db',
=======
>>>>>>> 253bdbd98d032668c29675d1b9e5a08adf107f07

  choiceBg: '#111827',
  choiceBorder: '#374151',

  choiceCorrectBg: '#065f46',
  choiceCorrectBorder: '#10b98155',
  choiceCorrectText: '#86efac',

  choiceWrongBg: '#7f1d1d',
  choiceWrongBorder: '#ef444455',
  choiceWrongText: '#fca5a5',
<<<<<<< HEAD

  errorBtnBg: '#ef4444',
};

export const ItemStyles = StyleSheet.create({
  /* ===== Root / Wrapper ===== */
=======
}

export const ItemStyles = StyleSheet.create({
  /* Screen */
>>>>>>> 253bdbd98d032668c29675d1b9e5a08adf107f07
  safeWrapDark: {
    flex: 1,
    backgroundColor: COLORS.bgScreen,
  },

<<<<<<< HEAD
  /* ===== Header ===== */
  header: {
    paddingHorizontal: 16,
    paddingTop: 6,
=======
  /* Header */
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
>>>>>>> 253bdbd98d032668c29675d1b9e5a08adf107f07
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
<<<<<<< HEAD
=======

>>>>>>> 253bdbd98d032668c29675d1b9e5a08adf107f07
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#11182744',
  },
<<<<<<< HEAD
  backBtnDark: {
    backgroundColor: COLORS.btnDarkBg,
  },
  headerTitleContainer: {
    flex: 1,
  },
=======

>>>>>>> 253bdbd98d032668c29675d1b9e5a08adf107f07
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
<<<<<<< HEAD
  headerTitleText: {
    color: COLORS.textPrimary,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  pillBase: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillLevel: {
    backgroundColor: COLORS.pillLevelBg,
    borderColor: COLORS.pillLevelBorder,
  },
  pillDuration: {
    backgroundColor: COLORS.pillDurationBg,
    borderColor: COLORS.pillDurationBorder,
  },
  pillHls: {
    backgroundColor: COLORS.pillHlsBg,
    borderColor: COLORS.pillHlsBorder,
  },
  pillLevelText: {
    color: COLORS.pillLevelText,
    fontSize: 12,
    fontWeight: '600',
  },
  pillDurationText: {
    color: COLORS.pillDurationText,
    fontSize: 12,
    fontWeight: '600',
  },
  pillHlsText: {
    color: COLORS.pillHlsText,
    fontSize: 12,
    fontWeight: '600',
  },
  headerRightPlaceholder: {
    width: 32,
    height: 32,
  },

  /* ===== Loading / Error / Empty ===== */
  loadingWrap: {
    padding: 24,
  },
  errorWrap: {
    padding: 20,
  },
  errorTitle: {
    color: COLORS.textDanger,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorMessage: {
    color: COLORS.textDangerSoft,
    marginBottom: 12,
    fontSize: 12,
  },
  errorRetryBtn: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.errorBtnBg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  errorRetryText: {
    color: '#fff',
    fontWeight: '700',
  },
  emptyWrap: {
    padding: 24,
  },
  emptyText: {
    color: COLORS.textPrimary,
  },

  /* ===== ScrollView content ===== */
=======
  headerTitleText: { color: COLORS.textPrimary },

  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Scroll */
>>>>>>> 253bdbd98d032668c29675d1b9e5a08adf107f07
  scrollContent: {
    padding: 16,
    gap: 16,
  },

<<<<<<< HEAD
  /* ===== Media card ===== */
  mediaCard: {
    width: '100%',
=======
  /* Media card */
  mediaCard: {
>>>>>>> 253bdbd98d032668c29675d1b9e5a08adf107f07
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
<<<<<<< HEAD
=======

>>>>>>> 253bdbd98d032668c29675d1b9e5a08adf107f07
  mediaCardHeader: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
<<<<<<< HEAD
  mediaCardHeaderText: {
    color: COLORS.textSoft,
    fontWeight: '600',
  },
=======

  mediaCardHeaderText: {
    color: COLORS.textSoft,
    fontWeight: '700',
  },

>>>>>>> 253bdbd98d032668c29675d1b9e5a08adf107f07
  mediaPlayerVideo: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
<<<<<<< HEAD
=======

>>>>>>> 253bdbd98d032668c29675d1b9e5a08adf107f07
  mediaPlayerAudio: {
    width: '100%',
    height: 64,
    backgroundColor: '#000',
  },
<<<<<<< HEAD
=======

>>>>>>> 253bdbd98d032668c29675d1b9e5a08adf107f07
  videoView: {
    width: '100%',
    height: '100%',
  },
<<<<<<< HEAD
=======

>>>>>>> 253bdbd98d032668c29675d1b9e5a08adf107f07
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

<<<<<<< HEAD
  /* ===== Transcript card ===== */
  transcriptCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
=======
  /* Transcript */
  transcriptCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },

>>>>>>> 253bdbd98d032668c29675d1b9e5a08adf107f07
  transcriptHeader: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
<<<<<<< HEAD
  transcriptHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
=======

>>>>>>> 253bdbd98d032668c29675d1b9e5a08adf107f07
  transcriptHeaderTitle: {
    color: COLORS.textSoft,
    fontWeight: '700',
  },
<<<<<<< HEAD
  transcriptToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: COLORS.toggleBg,
=======

  transcriptToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#111827',
>>>>>>> 253bdbd98d032668c29675d1b9e5a08adf107f07
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
<<<<<<< HEAD
  transcriptToggleText: {
    color: COLORS.toggleText,
    fontSize: 12,
    fontWeight: '600',
  },
  transcriptBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  transcriptText: {
    color: COLORS.textPrimary,
    lineHeight: 22,
    opacity: 0.95,
  },

  /* ===== Mini Quiz ===== */
=======

  transcriptText: {
    padding: 16,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },

  /* Quiz root */
>>>>>>> 253bdbd98d032668c29675d1b9e5a08adf107f07
  quizCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
<<<<<<< HEAD
    overflow: 'hidden',
  },
  quizHeader: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quizHeaderTitle: {
    color: COLORS.textSoft,
    fontWeight: '700',
  },
  quizBody: {
    padding: 16,
    gap: 12,
  },
  quizSentence: {
    color: COLORS.textPrimary,
  },
=======
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
>>>>>>> 253bdbd98d032668c29675d1b9e5a08adf107f07
  choiceBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.choiceBg,
    borderWidth: 1,
    borderColor: COLORS.choiceBorder,
<<<<<<< HEAD
  },
  choiceBtnCorrect: {
    backgroundColor: COLORS.choiceCorrectBg,
    borderColor: COLORS.choiceCorrectBorder,
  },
  choiceBtnWrong: {
    backgroundColor: COLORS.choiceWrongBg,
    borderColor: COLORS.choiceWrongBorder,
  },
  choiceText: {
    color: COLORS.textPrimary,
  },
  quizResult: {
    marginTop: 4,
    fontWeight: '700',
  },
  quizResultCorrect: {
    color: COLORS.choiceCorrectText,
  },
  quizResultWrong: {
    color: COLORS.choiceWrongText,
  },
});
=======
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
>>>>>>> 253bdbd98d032668c29675d1b9e5a08adf107f07
