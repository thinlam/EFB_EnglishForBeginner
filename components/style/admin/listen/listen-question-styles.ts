import { COLORS } from "@/components/style/colors/AppColors";
import { StyleSheet } from "react-native";

export const ListenQuestionStyles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },

  loadingWrap: { marginTop: 60 },

  backText: {
    fontSize: 16,
    marginBottom: 14,
    color: COLORS.text,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
  },

  sectionTitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },

  video: {
    width: "100%",
    height: 220,
    backgroundColor: "#000",
    borderRadius: 10,
    marginTop: 10,
  },

  segmentRow: {
    flexDirection: "row",
    marginTop: 14,
    gap: 10,
  },

  btnStart: {
    flex: 1,
    backgroundColor: "#22c55e",
    paddingVertical: 12,
    borderRadius: 8,
  },

  btnEnd: {
    flex: 1,
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    borderRadius: 8,
  },

  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },

  segmentInfo: {
    marginTop: 10,
    color: COLORS.subText,
  },

  kindWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    gap: 8,
  },

  kindBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.card2,
  },

  kindBtnActive: {
    backgroundColor: COLORS.create,
  },

  kindText: {
    color: COLORS.text,
  },

  kindTextActive: {
    color: COLORS.bg,
  },

  label: {
    marginTop: 20,
    fontSize: 16,
    color: COLORS.text,
  },

  input: {
    backgroundColor: COLORS.card2,
    padding: 12,
    borderRadius: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },

  segmentInfoSmall: {
    marginTop: 10,
    fontSize: 15,
    color: COLORS.textMuted,
  },

  saveBtn: {
    marginTop: 28,
    marginBottom: 40,
    padding: 16,
    backgroundColor: COLORS.create,
    borderRadius: 10,
  },

  saveText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.bg,
  },
});
