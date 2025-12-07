import { COLORS } from "@/components/style/colors/AppColors";
import { StyleSheet } from "react-native";

export const ListenCreateStyles = StyleSheet.create({
  /** BASE */
  container: {
    flex: 1,
    backgroundColor: COLORS.bgScreen,
  },

  scroll: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  /** HEADER */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.bg,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },

  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },

  saveText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.bg,
  },

  /** SECTION CARD */
  sectionCard: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },

  sectionHeader: {
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },

  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  /** FORM */
  formRow: {
    marginTop: 8,
  },

  formLabel: {
    marginBottom: 6,
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
  },

  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card2,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.text,
  },

  textarea: {
    minHeight: 120,
    textAlignVertical: "top",
  },

  /** MEDIA PREVIEW */
  mediaPreviewWrapper: {
    marginTop: 12,
  },

  mediaPreviewTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 6,
  },

  mediaPreviewVideoBox: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: COLORS.card2,
    borderRadius: 12,
    overflow: "hidden",
  },

  mediaPreviewVideoView: {
    width: "100%",
    height: "100%",
  },

  /** VIDEO THUMB */
  videoThumb: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: COLORS.card2,
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  /** AUDIO PLAYER */
  audioBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: COLORS.card2,
    borderRadius: 12,
    marginTop: 10,
  },

  audioText: {
    fontSize: 13,
    color: COLORS.text,
    flexShrink: 1,
  },

  /** ACTION ROWS */
  mediaActionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 18,
    marginTop: 10,
  },

  exerciseActionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 18,
    marginTop: 10,
  },

  actionBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  actionRemoveText: {
    fontSize: 13,
    color: COLORS.danger ?? "#d11a2a",
    fontWeight: "600",
  },

  actionChangeText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "600",
  },

  fileName: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.textMuted,
  },

  /** ⭐ PROGRESS TEXT (nằm ngang, không lệch) */
  progressText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },

  /** EXERCISE PREVIEW */
  exercisePreview: {
    marginTop: 6,
    padding: 12,
    backgroundColor: COLORS.card2,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  exerciseText: {
    fontSize: 13,
    color: COLORS.text,
  },

  /** MODAL VIDEO */
  videoModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },

  videoModalClose: {
    position: "absolute",
    top: 40,
    right: 20,
    padding: 10,
  },

  videoModalBox: {
    width: "90%",
    aspectRatio: 16 / 9,
    backgroundColor: COLORS.card2,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
  },

  videoModalPlayer: {
    width: "100%",
    height: "100%",
  },

  /** LOADING */
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
