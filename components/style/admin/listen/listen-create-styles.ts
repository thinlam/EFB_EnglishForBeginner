// components/style/admin/listen/listen-create-styles.ts
import { Platform, StyleSheet } from 'react-native';
import { COLORS } from './listen-screen-styles';

export const ListenCreateStyles = StyleSheet.create({
  /* =========== CƠ BẢN CHO SCREEN & INPUT =========== */
  screen: {
    width: '100%',
    maxWidth: 720,          // đẹp hơn trên web, tablet
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 12,
  },

  label: {
    marginBottom: 6,
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: '600',
  },

  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 14,
    backgroundColor: COLORS.card,
    marginBottom: 12,
  },

  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  /* ---- Section card ---- */
  sectionCard: {
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },

  pickBtn: {
    marginTop: 4,
    marginBottom: 8,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.create,

    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  pickBtnDisabled: {
    opacity: 0.6,
  },

  pickBtnText: {
    color: COLORS.bg,
    fontWeight: '600',
    fontSize: 14,
  },

  fileName: {
    marginTop: 2,
    marginBottom: 8,
    fontSize: 12,
    color: COLORS.muted,
  },

  progressText: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.muted,
  },

  saveBtn: {
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.create,

    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  saveBtnDisabled: {
    opacity: 0.6,
  },

  saveBtnText: {
    color: COLORS.bg,
    fontWeight: '700',
    fontSize: 15,
  },

  /* ---- Header ---- */
  headerRightPlaceholder: {
    width: 22,
  },

  scroll: {
    flex: 1,
  },

  /* ---- Level Picker (modal) ---- */
  levelPickerTrigger: {
    marginBottom: 12,
  },
  levelModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelModalContainer: {
    width: '86%',
    maxWidth: 380,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    overflow: 'hidden',

    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  levelModalHeader: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  levelModalTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  levelOptionRow: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelOptionText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '500',
  },
  levelOptionTextActive: {
    fontWeight: '700',
  },
  levelModalFooter: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'flex-end',
  },
  levelModalCloseBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  levelModalCloseText: {
    color: COLORS.text,
    fontWeight: '700',
  },

  /* ---- Media Preview ---- */
  mediaPreviewWrapper: {
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mediaPreviewCard: {
    backgroundColor: COLORS.card,
    padding: 12,
  },
  mediaPreviewTitle: {
    color: COLORS.text,
    fontWeight: '700',
    marginBottom: 8,
  },
  mediaPreviewPlayerBase: {
    width: '100%',
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
  },
  mediaPreviewPlayerVideo: {
    // 16:9
    aspectRatio: 16 / 9,
  },
  mediaPreviewPlayerAudio: {
    height: 56,
  },
  mediaPreviewVideoView: {
    width: '100%',
    height: '100%',
  },

  /* ---- Loading ---- */
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ---- Published toggle ---- */
  publishedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  publishToggleBase: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  publishToggleOn: {
    backgroundColor: '#16a34a',
    borderColor: '#15803d',
  },
  publishToggleOff: {
    backgroundColor: '#9ca3af',
    borderColor: '#6b7280',
  },
  publishToggleText: {
    color: '#fff',
    fontWeight: '700',
  },

  /* ---- Exercise type input ---- */
  exerciseTypeInput: {
    opacity: 0.85,
  },

  /* ---- Payload section ---- */
  payloadInput: {
    minHeight: 140,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    lineHeight: 18,
  },

  payloadHint: {
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 4,
  },
});
