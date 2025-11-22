// components/admin/TransactionDetailSheet.tsx
import type { Transaction } from '@/types/admin/transactionTypes';
import React from 'react';
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  onCancel: () => void;
  item: Transaction | null;
};

export function TransactionDetailSheet({
  visible,
  onClose,
  onUpgrade,
  onCancel,
  item,
}: Props) {
  if (!item) return null;

  const formatTs = (value: any) => {
    if (!value?.seconds) return '—';
    return new Date(value.seconds * 1000).toLocaleString('vi-VN');
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      {/* Nền mờ */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View />
      </Pressable>

      <View style={styles.sheet}>
        <Text style={styles.title}>Chi tiết giao dịch</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{item.email || '—'}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Gói</Text>
          <Text style={styles.value}>{item.planLabel || item.planId || '—'}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Giá</Text>
          <Text style={styles.value}>
            {item.price?.toLocaleString('vi-VN') || 0} {item.currency || 'VND'}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Trạng thái</Text>
          <Text
            style={[
              styles.value,
              {
                color:
                  item.status === 'success'
                    ? '#16A34A'
                    : item.status === 'revoked'
                    ? '#DC2626'
                    : '#6B7280',
              },
            ]}
          >
            {item.status}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>User ID</Text>
          <Text style={styles.value}>{item.userId || '—'}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Thời gian tạo</Text>
          <Text style={styles.value}>{formatTs(item.createdAt)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Hết hạn</Text>
          <Text style={styles.value}>{formatTs(item.expireAt)}</Text>
        </View>

        {item.status === 'success' && (
          <>
            <TouchableOpacity style={styles.btnPrimary} onPress={onUpgrade}>
              <Text style={styles.btnPrimaryText}>
                NÂNG CẤP / KHÔI PHỤC PREMIUM
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnDanger} onPress={onCancel}>
              <Text style={styles.btnDangerText}>HUỶ GÓI PREMIUM NGAY</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={styles.btnClose} onPress={onClose}>
          <Text style={styles.btnCloseText}>Đóng</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  row: {
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  btnPrimary: {
    marginTop: 16,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
  },
  btnPrimaryText: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  btnDanger: {
    marginTop: 10,
    backgroundColor: '#FEE2E2',
    paddingVertical: 11,
    borderRadius: 10,
  },
  btnDangerText: {
    textAlign: 'center',
    color: '#B91C1C',
    fontSize: 14,
    fontWeight: '700',
  },
  btnClose: {
    marginTop: 10,
    paddingVertical: 8,
  },
  btnCloseText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
});
