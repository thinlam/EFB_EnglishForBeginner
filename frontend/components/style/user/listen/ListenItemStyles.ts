// components/style/user/listen/ItemStyles.ts
import { COLORS } from "@/components/style/colors/AppColors";
import { StyleSheet } from "react-native";

export const ItemStyles = StyleSheet.create({
  /* WRAPPERS */
  safeWrapDark: {
    flex: 1,
    backgroundColor: COLORS.bgScreen,
  },

  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.bgScreen,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },

  /* HEADER */
  header: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    justifyContent: "space-between",
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.card2,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },

  headerTitleText: {
    maxWidth: "70%",
    textAlign: "center",
  },

  /* MEDIA CARD */
  mediaCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  mediaCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  mediaCardHeaderText: {
    marginLeft: 6,
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textMuted,
  },

  mediaPlayerVideo: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
  },

  mediaPlayerAudio: {
    width: "100%",
    height: 80,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
  },

  videoView: {
    width: "100%",
    height: "100%",
  },

  noMediaCard: {
    backgroundColor: COLORS.card,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },

  noMediaText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },

  /* TRANSCRIPT */
  transcriptCard: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },

  transcriptHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  transcriptHeaderTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
  },

  transcriptToggleBtn: {
    padding: 6,
  },

  transcriptText: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.subText,
  },

  /* QUIZ */
  quizCard: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 30,
  },

  quizHeaderTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 14,
    color: COLORS.text,
  },

  quizItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },

  quizItemTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },

  quizSegmentText: {
    fontSize: 13,
    color: COLORS.link,
    fontWeight: "600",
  },

  quizItemText: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.text,
  },

  /* CHOICE BUTTON */
  choiceBtn: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: COLORS.choiceBg,
    borderWidth: 1,
    borderColor: COLORS.choiceBorder,
  },

  choiceSelected: {
    borderColor: COLORS.primary,
    backgroundColor: "#eff6ff",
  },

  choiceCorrect: {
    backgroundColor: COLORS.choiceCorrectBg,
    borderColor: COLORS.choiceCorrectBorder,
  },

  choiceWrong: {
    backgroundColor: COLORS.choiceWrongBg,
    borderColor: COLORS.choiceWrongBorder,
  },

  choiceText: {
    fontSize: 15,
    color: COLORS.text,
  },

  /* SUBMIT BUTTON */
  checkBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
  },

  checkBtnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 15,
  },

  /* RESULT TEXT */
  quizResult: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "600",
  },

  quizResultCorrect: {
    color: COLORS.choiceCorrectText,
  },

  quizResultWrong: {
    color: COLORS.choiceWrongText,
  },
});
