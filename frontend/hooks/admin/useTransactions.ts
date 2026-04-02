// hooks/admin/useTransactions.ts
import { db } from '@/scripts/firebase';
import {
    applyPremiumFromTransaction,
    cancelPremiumFromTransaction,
} from '@/services/admin/premiumService';
import type { Transaction } from '@/types/admin/transactionTypes';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedItem, setSelectedItem] = useState<Transaction | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    reload();
  }, []);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const ref = collection(db, 'premiumPurchases');
      const q = query(ref, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);

      const list: Transaction[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));

      setTransactions(list);
    } catch (e) {
      console.log('Load premiumPurchases error:', e);
      setError('Không tải được dữ liệu giao dịch Premium.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item: Transaction) => {
    setSelectedItem(item);
    setShowDetail(true);
  };

  const closeDetail = () => {
    setShowDetail(false);
  };

  const updatePremiumFromTx = async (tx: Transaction) => {
    try {
      await applyPremiumFromTransaction(tx);
      Alert.alert('Thành công', 'Đã cập nhật Premium cho user theo giao dịch này.');
    } catch (e) {
      console.log('updatePremiumFromTx error:', e);
      Alert.alert('Lỗi', 'Không thể cập nhật Premium cho user.');
    }
  };

  const cancelPremiumFromTx = async (tx: Transaction) => {
    try {
      await cancelPremiumFromTransaction(tx);
      Alert.alert('Đã huỷ gói', 'Gói Premium của user đã được huỷ.');
      reload();
    } catch (e) {
      console.log('cancelPremiumFromTx error:', e);
      Alert.alert('Lỗi', 'Không thể huỷ gói Premium của user.');
    }
  };

  return {
    transactions,
    loading,
    error,
    reload,
    handleSelect,
    selectedItem,
    showDetail,
    closeDetail,
    updatePremiumFromTx,
    cancelPremiumFromTx,
  };
}
