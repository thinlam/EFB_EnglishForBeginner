// components/style/writing/WritingDetailStyles.ts
import { StyleSheet } from "react-native";

export const WritingDetailStyles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F8FAFC",
    paddingBottom: 50,
  },

  image: {
    width: "100%",
    height: 170,
    borderRadius: 12,
    marginBottom: 14,
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },

  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginTop: 12,
    marginBottom: 4,
  },

  text: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 22,
  },

  tips: {
    fontSize: 14,
    color: "#1E3A8A",
    backgroundColor: "#EFF6FF",
    padding: 10,
    borderRadius: 10,
    lineHeight: 20,
  },

  sampleToggle: {
    marginTop: 14,
    color: "#4F46E5",
    fontSize: 15,
    fontWeight: "600",
  },

  sample: {
    fontSize: 14,
    color: "#374151",
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
    lineHeight: 20,
  },

  startBtn: {
    marginTop: 20,
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },

  startText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
