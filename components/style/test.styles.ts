import { StyleSheet } from "react-native";

export const testStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },

  headerSub: {
    marginTop: 4,
    fontSize: 14,
    color: "#6b7280",
  },

  question: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 14,
    color: "#111827",
  },

  option: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },

  optionText: {
    fontSize: 16,
    color: "#111827",
  },

  reorderBox: {
    minHeight: 56,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2563eb",
    backgroundColor: "#f8fafc",
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 14,
  },

  wordChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },

  passage: {
    fontSize: 16,
    lineHeight: 24,
    color: "#111827",
  },

  footerBtn: {
    paddingVertical: 16,
    borderRadius: 10,
  },

  footerText: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
});
