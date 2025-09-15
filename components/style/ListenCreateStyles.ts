// components/style/ListenCreateStyles.ts
import { Platform, StyleSheet } from 'react-native';
import { COLORS } from './ListenStyles'; // tái dùng bảng màu chung

export const ListenCreateStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  /* Header */
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSoft,
    backgroundColor: COLORS.card,
  },
  backBtn: {
    width: 42,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },

  /* Form card */
  content: {
    padding: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    // bóng nhẹ để nhìn “xịn” hơn
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  sectionTitle: {
    color: COLORS.text,
    fontWeight: '800',
    fontSize: 18,
    marginBottom: 2,
  },
  sectionHint: {
    color: COLORS.muted,
    fontSize: 12,
    marginBottom: 6,
  },

  /* Label + input wrapper (có icon trái) */
  label: {
    color: COLORS.muted,
    marginBottom: 6,
  },
  inputWrap: {
    position: 'relative',
  },
  leftIcon: {
    position: 'absolute',
    left: 12,
    top: 12,
    opacity: 0.75,
  },
  input: {
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.card2,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 44, // chừa chỗ icon trái
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  /* Picker (giữ UI giống list) */
  pickerShell: {
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.card2,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  pickerText: {
    color: COLORS.text,
    fontWeight: '700',
  },
  pickerChevron: {
    position: 'absolute',
    right: 10,
    top: 12,
  },
  hiddenPicker: {
    ...Platform.select({
      ios: { opacity: 0 },
      default: { position: 'absolute', inset: 0, color: 'transparent' } as any,
    }),
  },

  /* File button + file name */
  fileBtn: {
    backgroundColor: COLORS.edit,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fileBtnText: {
    color: COLORS.text,
    fontWeight: '700',
  },
  fileName: {
    color: COLORS.muted,
  },

  /* Progress */
  progressRow: {
    gap: 6,
  },
  progressText: {
    color: COLORS.muted,
    fontSize: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 8,
    backgroundColor: COLORS.borderSoft,
    overflow: 'hidden',
  },
  progressInner: {
    height: 8,
    backgroundColor: COLORS.create,
  },

  /* Save button */
  saveBtn: {
    backgroundColor: COLORS.create,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveText: {
    color: COLORS.bg,
    fontWeight: '800',
  },
});
