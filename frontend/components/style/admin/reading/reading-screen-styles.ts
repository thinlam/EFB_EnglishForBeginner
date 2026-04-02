import { COLORS } from "@/components/style/colors/AppColors";
import { StyleSheet } from "react-native";

export const ReadingScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },

  backBtn: {
    padding: 4,
    paddingRight: 8,
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },

  /* FILTER + SEARCH */
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 10,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    paddingHorizontal: 10,
    height: 42,
    flex: 1,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 6,
  },

  filterPicker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    paddingHorizontal: 12,
    height: 42,
    flex: 1,
    justifyContent: "space-between",
  },

  filterValueText: {
    fontSize: 14,
    color: COLORS.text,
  },

  /* EMPTY LIST */
  emptyWrap: {
    marginTop: 40,
    alignItems: "center",
    paddingHorizontal: 20,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },

  emptyText: {
    marginTop: 6,
    fontSize: 14,
    color: COLORS.subText,
    textAlign: "center",
  },

  emptyEm: {
    color: COLORS.create,
    fontWeight: "700",
  },

  /* CARD */
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  cardTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
    flexShrink: 1,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  badgeText: {
    color: COLORS.bg,
    fontWeight: "700",
    fontSize: 12,
  },

  /* ROW */
  rowLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },

  rowLabel: {
    color: COLORS.subText,
    fontSize: 13,
  },

  rowText: {
    color: COLORS.text,
    fontSize: 14,
  },

  rowTextLink: {
    color: COLORS.link,
    fontSize: 14,
    textDecorationLine: "underline",
  },

  /* ACTION BUTTONS */
  cardActions: {
    flexDirection: "row",
    marginTop: 12,
    gap: 12,
  },

  iconBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card2,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },

  iconBtnText: {
    marginLeft: 6,
    fontSize: 14,
    color: COLORS.text,
  },

  /* FAB */
  fab: {
    position: "absolute",
    right: 24,
    width: 54,
    height: 54,
    borderRadius: 30,
    backgroundColor: COLORS.create,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },

  /* MODAL OVERLAY */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },

  modalBox: {
    width: "92%",
    maxWidth: 520,
    maxHeight: "80%",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    overflow: "hidden",
  },

  modalCloseBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 6,
    borderRadius: 10,
    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    zIndex: 10,
  },

  modalHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },

  modalScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  modalText: {
    color: COLORS.subText,
    fontSize: 14,
    lineHeight: 22,
  },

  modalInput: {
    color: COLORS.text,
    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: 10,
    padding: 12,
    minHeight: 160,
    textAlignVertical: "top",
  },

  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  /* PICKERS */
  pickerBox: {
    width: 260,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },

  pickerHeader: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  pickerHeaderText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },

  pickerItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSoft,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  pickerItemText: {
    fontSize: 15,
    color: COLORS.text,
  },
});
