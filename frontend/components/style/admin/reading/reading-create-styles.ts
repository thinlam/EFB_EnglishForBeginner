import { COLORS } from '@/components/style/colors/AppColors';
import { StyleSheet } from 'react-native';

export const ReadingCreateStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  backBtn: {
    width: 40,
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
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 34,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  saveText: { fontWeight: '700', fontSize: 13 },

  formWrap: { paddingHorizontal: 16, paddingBottom: 40, gap: 14 },
  formRow: { gap: 6 },
  formGroupRow: { flexDirection: 'row', gap: 10 },
  formLabel: { color: COLORS.subText, fontSize: 14, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.card2,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: COLORS.text,
    fontSize: 14,
  },
  textarea: { minHeight: 160, textAlignVertical: 'top' },
  picker: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.card2,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
    /* ───────────────────── Modal Styles ───────────────────── */

  modalWrap: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalBox: {
    width: '85%',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
    color: COLORS.text,
    textAlign: 'center',
  },

  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: COLORS.card2,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.borderSoft,
    marginBottom: 6,
  },

  modalItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },

  modalClose: {
    marginTop: 12,
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },

  modalCloseText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.create,
  },

  pickerValue: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
});
