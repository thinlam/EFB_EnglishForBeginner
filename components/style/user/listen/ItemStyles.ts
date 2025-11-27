// components/style/user/listen/ItemStyles.ts
import { StyleSheet } from 'react-native';

/* Bảng màu riêng cho màn Listen Item */
const COLORS = {
  bgScreen: '#0b1220',

  cardBg: '#0f172a',
  cardBorder: '#1f2937',

  textPrimary: '#e5e7eb',
  textMuted: '#94a3b8',
  textSoft: '#cbd5e1',
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

  choiceBg: '#111827',
  choiceBorder: '#374151',

  choiceCorrectBg: '#065f46',
  choiceCorrectBorder: '#10b98155',
  choiceCorrectText: '#86efac',

  choiceWrongBg: '#7f1d1d',
  choiceWrongBorder: '#ef444455',
  choiceWrongText: '#fca5a5',

  errorBtnBg: '#ef4444',
};

export const ItemStyles = StyleSheet.create({
  /* ===== Root / Wrapper ===== */
  safeWrapDark: {
    flex: 1,
    backgroundColor: COLORS.bgScreen,
  },

  /* ===== Header ===== */
  header: {
    paddingHorizontal: 16,
    paddingTop: 6,
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
  backBtnDark: {
    backgroundColor: COLORS.btnDarkBg,
  },
  headerTitleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
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
  scrollContent: {
    padding: 16,
    gap: 16,
  },

  /* ===== Media card ===== */
  mediaCard: {
    width: '100%',
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
    fontWeight: '600',
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

  /* ===== Transcript card ===== */
  transcriptCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    overflow: 'hidden',
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
  transcriptHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transcriptHeaderTitle: {
    color: COLORS.textSoft,
    fontWeight: '700',
  },
  transcriptToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: COLORS.toggleBg,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
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
  quizCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
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
  choiceBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.choiceBg,
    borderWidth: 1,
    borderColor: COLORS.choiceBorder,
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
