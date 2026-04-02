// components/style/admin/transactionStyles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  summaryBar: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111827',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 10,
  },
  email: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  planLabel: {
    fontSize: 14,
    marginTop: 2,
    color: '#4B5563',
  },
  price: {
    fontSize: 14,
    marginTop: 2,
    color: '#111827',
  },
  time: {
    fontSize: 12,
    marginTop: 4,
    color: '#6B7280',
  },
  statusWrapper: {
    marginLeft: 8,
  },
  status: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '700',
  },
  ok: {
    backgroundColor: '#DCFCE7',
    color: '#15803D',
  },
  fail: {
    backgroundColor: '#FEE2E2',
    color: '#B91C1C',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  helperText: {
    marginTop: 12,
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
  helperSubText: {
    marginTop: 4,
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#B91C1C',
    textAlign: 'center',
  },
  reloadBtn: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#111827',
  },
  reloadText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  headerRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 12,
},

backBtn: {
  width: 40,
  height: 40,
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 4,
},
filterRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 10,
  columnGap: 8, // hoặc gap: 8 nếu React Native version hỗ trợ
},

filterBtn: {
  paddingVertical: 6,
  paddingHorizontal: 14,
  borderRadius: 999,
  backgroundColor: '#E5E7EB',
},

filterBtnActive: {
  backgroundColor: '#2563EB',
},

filterText: {
  fontSize: 13,
  fontWeight: '500',
  color: '#374151',
},

filterTextActive: {
  color: '#FFFFFF',
},


});
