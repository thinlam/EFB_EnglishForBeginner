// components/style/user/writing/WritingDetailStyles.ts

import { StyleSheet } from "react-native";

export const WritingDetailStyles = StyleSheet.create({

  // HERO
  heroContainer: {
    width: "100%",
    height: 260,
    position: "relative",
  },

  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  heroOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  heroTitle: {
    position: "absolute",
    bottom: 20,
    left: 20,
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },

  // CONTENT
  contentCard: {
    marginTop: -32,
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  sectionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
    marginTop: 14,
  },

  sectionText: {
    fontSize: 16,
    lineHeight: 23,
    color: "#444",
  },

  tipsText: {
    fontSize: 15,
    color: "#567",
    lineHeight: 22,
    backgroundColor: "#f4f6f8",
    padding: 12,
    borderRadius: 10,
    marginTop: 4,
  },

  // SAMPLE
  sampleBtn: {
    marginTop: 20,
    alignSelf: "flex-start",
  },

  sampleBtnText: {
    color: "#0066CC",
    fontSize: 15,
    fontWeight: "600",
  },

  sampleCard: {
    marginTop: 10,
    padding: 18,
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },

  sampleText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#444",
  },

  // CTA
  ctaBtn: {
    marginTop: 28,
    backgroundColor: "#4A90E2",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  ctaText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },

  // Back fallback
  backBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#ddd",
    borderRadius: 12,
  },

  backBtnText: {
    fontSize: 15,
    color: "#222",
  },
});
