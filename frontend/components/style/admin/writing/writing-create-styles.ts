// components/style/admin/writing/writing-create-styles.ts
import { COLORS } from '@/components/style/colors/AppColors';
import { StyleSheet } from 'react-native';

export const WritingCreateStyles = StyleSheet.create({
  /* ===== MAIN CONTAINER ===== */
  container: {
    flex: 1,
    backgroundColor: COLORS.bgScreen,
  },

  /* ===== HEADER ===== */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bg,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },

  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },

  saveText: {
    fontSize: 14,
    fontWeight: '600',
  },

  /* ===== FORM (SCROLL CONTENT) ===== */
  formWrap: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },

  /* ===== SECTION CARD ===== */
  sectionCard: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 5,
    elevation: 1,
    marginBottom: 16,
  },

  sectionHeader: {
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },

  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  /* ===== FORM INPUTS ===== */
  formRow: {
    marginTop: 10,
  },

  formLabel: {
    marginBottom: 6,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },

  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card2,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: COLORS.text,
  },

  textarea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },

  inlineHelpText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  formGroupRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },

  smallField: {
    flex: 1,
  },

  /* ===== PICKER BUTTON ===== */
  picker: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: COLORS.card2,
  },

  pickerLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },

  pickerValue: {
    fontSize: 14,
    color: COLORS.text,
    marginTop: 1,
    fontWeight: '500',
  },

  pickerPlaceholder: {
    color: COLORS.textSoft,
    fontWeight: '400',
  },

  /* ===== BADGES ===== */
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    flexWrap: 'wrap',
  },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: COLORS.bg,
    borderColor: COLORS.border,
    borderWidth: 1,
  },

  badgeText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },

  /* ===== IMAGE AREA ===== */
  imagePreview: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: COLORS.card2,
  },

  imageEmptyBox: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    backgroundColor: COLORS.card2,
  },

  imageEmptyText: {
    marginTop: 6,
    fontSize: 12,
    color: COLORS.textMuted,
  },

  imageActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },

  imageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },

  imageBtnPrimary: {
    backgroundColor: COLORS.create,
    borderColor: COLORS.create,
  },

  imageBtnText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
  },

  imageBtnTextPrimary: {
    color: COLORS.bg,
    fontWeight: '600',
  },

  /* ===== MODAL ===== */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  modalBox: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  modalHeader: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 4,
  },

  modalTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },

  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },

  modalItemText: {
    fontSize: 14,
    color: COLORS.text,
  },

  /* ===== LOADING OVERLAY ===== */
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingBox: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  loadingText: {
    fontSize: 13,
    color: COLORS.text,
  },
});
