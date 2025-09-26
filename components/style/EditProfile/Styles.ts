import { StyleSheet } from "react-native";

export const EditProfileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  /** Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    marginBottom: 6,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },

  /** Avatar */
  avatarWrap: {
    alignSelf: "center",
    marginVertical: 16,
  },
  avatar: {
    width: 108,
    height: 108,
    borderRadius: 64,
    backgroundColor: "#f2f4f7",
  },
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  camBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
  },

  /** Form */
  formGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#ffffff",
  },
  textarea: {
    minHeight: 96,
    textAlignVertical: "top",
  },

  /** Buttons */
  primaryBtn: {
    marginTop: 16,
    backgroundColor: "#4f46e5",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#4f46e5",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },

  mutedText: {
    marginTop: 8,
    fontSize: 13,
    color: "#6b7280",
  },
});
