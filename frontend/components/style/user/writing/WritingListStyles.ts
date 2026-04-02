// components/style/writing/WritingListStyles.ts
import { StyleSheet } from "react-native";

export const WritingListStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },

  list: {
    padding: 16,
    paddingBottom: 80,
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,

    // iOS shadow
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },

    // Android
    elevation: 2,
  },

  thumbWrap: {
    width: "100%",
    height: 140,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 10,
  },

  thumb: {
    width: "100%",
    height: "100%",
  },

  thumbPlaceholder: {
    width: "100%",
    height: 140,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  topic: {
    fontSize: 13,
    color: "#6B7280",
  },

  levelBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },

  levelText: {
    color: "#4F46E5",
    fontWeight: "700",
    fontSize: 12,
  },

  words: {
    fontSize: 13,
    color: "#6B7280",
  },
});
