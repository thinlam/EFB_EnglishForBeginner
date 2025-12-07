import { COLORS } from "@/components/style/colors/AppColors";
import { StyleSheet } from "react-native";

export const ListenScreenStyles = StyleSheet.create({

  /* =============================
   * SCREEN
   * ============================= */
  container: {
    flex: 1,
    backgroundColor: COLORS.bgScreen,
  },

  /* =============================
   * HEADER
   * ============================= */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    color: COLORS.text,
  },

  headerSpacer: { width: 32 },

  /* =============================
   * SEARCH + FILTER (giống Reading)
   * ============================= */
  filterRow: {
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 16,
    paddingVertical: 14,

    backgroundColor: COLORS.bg,

    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,

    gap: 10,
  },

  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: 12,

    paddingHorizontal: 14,
    height: 42,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    paddingVertical: 0,
  },

  filterPicker: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: 12,

    paddingHorizontal: 14,
    height: 42,
  },

  filterValueText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },

  /* =============================
   * EMPTY STATE
   * ============================= */
  emptyWrap: {
    padding: 28,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },

  emptyText: {
    fontSize: 13,
    color: COLORS.muted,
    textAlign: "center",
  },

  emptyEm: {
    color: COLORS.create,
    fontWeight: "700",
  },

  spinner: { marginTop: 40 },

  /* =============================
   * CARDS
   * ============================= */
  card: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    padding: 16,

    borderWidth: 1,
    borderColor: COLORS.borderSoft,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },

  flex1: { flex: 1 },
  alignEnd: { alignItems: "flex-end" },

  /* Badge */
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.bg,
  },

  /* =============================
   * ROW INFO
   * ============================= */
  rowLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },

  rowLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },

  rowText: {
    fontSize: 12,
    color: COLORS.subText,
  },

  rowTextLink: {
    fontSize: 13,
    color: COLORS.link,
    textDecorationLine: "underline",
  },

  /* =============================
   * CARD ACTION BUTTONS
   * ============================= */
  cardActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },

  iconBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,

    paddingHorizontal: 10,
    paddingVertical: 8,

    backgroundColor: COLORS.card2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },

  iconBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
  },

  textEdit: { color: COLORS.edit },
  textDel: { color: COLORS.del },

  /* =============================
   * LEVEL QUICK PICKER
   * ============================= */
  levelRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },

  levelChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card2,
  },

  levelChipActive: {
    backgroundColor: COLORS.text,
    borderColor: COLORS.text,
  },

  levelChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
  },

  levelChipTextActive: {
    color: COLORS.bg,
  },

  /* =============================
   * FAB
   * ============================= */
  fab: {
    position: "absolute",
    right: 18,
    width: 54,
    height: 54,
    borderRadius: 27,

    backgroundColor: COLORS.create,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },

  /* =============================
   * TRANSCRIPT MODAL
   * ============================= */
  overlayCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  dialog: {
    width: "92%",
    maxWidth: 520,
    maxHeight: "80%",

    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingTop: 48,

    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },

  closeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 6,
    backgroundColor: COLORS.card2,
    borderRadius: 8,
  },

  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  modalBody: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },

  modalText: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.subText,
  },

  modalInput: {
    minHeight: 160,
    padding: 12,

    borderRadius: 10,
    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,

    color: COLORS.text,
    textAlignVertical: "top",
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    padding: 12,

    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  editBtnBg: { backgroundColor: COLORS.card2 },
  saveBtnBg: { backgroundColor: COLORS.create },
  saveBtnText: { color: COLORS.bg },

  /* =============================
   * LEVEL/TOPIC PICKER MODAL
   * ============================= */
  overlayDim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  levelDialog: {
    width: 260,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    overflow: "hidden",
  },

  levelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSoft,
  },

  levelTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },

  levelItemRow: {
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSoft,
  },

  levelItemText: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.text,
  },

  levelItemTextSelected: {
    fontWeight: "700",
    color: COLORS.create,
  },
});
