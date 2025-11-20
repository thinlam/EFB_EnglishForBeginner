// components/style/EditProfile/Styles.ts
import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

export const EditProfileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // nền xám nhạt
  },

  body: {
    flex: 1,
  },

  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ---------- Header ---------- */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: {
    flex: 1,
    marginHorizontal: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: '#6B7280',
  },

  /* ---------- Scroll & Card ---------- */
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 8,
    // shadow iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    // elevation Android
    elevation: 4,
  },

  /* ---------- Avatar ---------- */
  avatarSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  avatarOuter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBorder: {
    padding: 3,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#6366F1',
    backgroundColor: '#E5E7EB',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 999,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5E7EB',
  },
  camBadge: {
    position: 'absolute',
    bottom: 0,
    right: (width / 2 - 96) / 2 * -1, // badge lệch nhẹ sang phải avatar
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  avatarHint: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
  },

  /* ---------- Form ---------- */
  formGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  labelHelper: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  inputReadOnly: {
    justifyContent: 'center',
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  helperText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },

  mutedText: {
    fontSize: 13,
    color: '#6B7280',
  },

  /* ---------- Footer buttons ---------- */
  footer: {
    flexDirection: 'row',
    marginTop: 18,
    gap: 10,
  },
  primaryBtn: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryBtn: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  secondaryBtnText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  btnDisabled: {
    opacity: 0.55,
  },
});
