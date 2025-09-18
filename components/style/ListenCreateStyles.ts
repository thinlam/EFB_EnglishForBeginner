// components/style/ListenCreateStyles.ts
import { StyleSheet } from 'react-native';
import { COLORS } from './ListenStyles';

export const ListenCreateStyles = StyleSheet.create({
  screen: { padding: 16 },

  label: { color: COLORS.muted, marginBottom: 6 },

  input: {
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.card2,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },

  inputMultiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },

  pickBtn: {
    backgroundColor: COLORS.edit,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pickBtnText: {
    color: COLORS.text,
    fontWeight: '700',
  },

  fileName: { color: COLORS.muted, marginBottom: 6 },

  progressText: { color: COLORS.muted, marginBottom: 10 },

  saveBtn: {
    backgroundColor: COLORS.create,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveBtnText: { color: COLORS.bg, fontWeight: '800' },
});
