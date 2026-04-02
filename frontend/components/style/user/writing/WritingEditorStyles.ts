// components/style/writing/WritingEditorStyles.ts
import { StyleSheet } from "react-native";

export const WritingEditorStyles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: "#F8FAFC",
  },

  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },

  input: {
    width: "100%",
    minHeight: 260,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    padding: 12,
    fontSize: 14,
    color: "#111827",
    textAlignVertical: "top",

    // shadow iOS
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },

    // Android
    elevation: 1,
  },

  count: {
    marginTop: 8,
    fontSize: 13,
    color: "#6B7280",
  },

  countWarn: {
    color: "#DC2626",
    fontWeight: "600",
  },

  submit: {
    marginTop: 18,
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },

  submitText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
