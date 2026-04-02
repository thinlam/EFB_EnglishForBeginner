// app/(admin)/transactions/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TransactionDetailSheet } from '@/components/admin/TransactionDetailSheet';
import { styles } from '@/components/style/admin/transactionStyles';
import { useTransactions } from '@/hooks/admin/useTransactions';

export default function TransactionsScreen() {
  const router = useRouter();

  const {
    loading,
    error,
    transactions,
    reload,
    handleSelect,
    selectedItem,
    showDetail,
    closeDetail,
    updatePremiumFromTx,
    cancelPremiumFromTx,
  } = useTransactions();

  const [filter, setFilter] = useState<'all' | 'monthly' | 'yearly'>('all');

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    if (filter === 'all') return transactions;
    return transactions.filter((t) => t.planId === filter);
  }, [transactions, filter]);

  const renderContent = () => {
    if (loading && transactions.length === 0) {
      return (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" />
          <Text style={styles.helperText}>Đang tải danh sách giao dịch...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.reloadBtn} onPress={reload}>
            <Text style={styles.reloadText}>Thử tải lại</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!transactions || transactions.length === 0) {
      return (
        <View style={styles.centerBox}>
          <Text style={styles.helperText}>Chưa có giao dịch Premium nào.</Text>
          <Text style={styles.helperSubText}>
            Kiểm tra collection &quot;premiumPurchases&quot; trên Firestore nhé.
          </Text>
        </View>
      );
    }

    const totalRevenue = transactions
      .filter((t) => t.status === 'success')
      .reduce((sum, t) => sum + (t.price || 0), 0);

    const totalFiltered = filteredTransactions.length;

    return (
      <View style={{ flex: 1 }}>
        {/* Filter: Tất cả / Gói tháng / Gói năm */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]}
            onPress={() => setFilter('all')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'all' && styles.filterTextActive,
              ]}
            >
              Tất cả
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterBtn,
              filter === 'monthly' && styles.filterBtnActive,
            ]}
            onPress={() => setFilter('monthly')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'monthly' && styles.filterTextActive,
              ]}
            >
              Gói tháng
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterBtn,
              filter === 'yearly' && styles.filterBtnActive,
            ]}
            onPress={() => setFilter('yearly')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'yearly' && styles.filterTextActive,
              ]}
            >
              Gói năm
            </Text>
          </TouchableOpacity>
        </View>

        {/* Summary */}
        <View style={styles.summaryBar}>
          <Text style={styles.summaryText}>
            Tổng giao dịch: {transactions.length} | Đang hiển thị: {totalFiltered}
          </Text>
          <Text style={styles.summaryText}>
            Doanh thu (success): {totalRevenue.toLocaleString('vi-VN')} VND
          </Text>
        </View>

        {/* List */}
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} />}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.item} onPress={() => handleSelect(item)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.email}>{item.email || '—'}</Text>
                <Text style={styles.planLabel}>
                  Gói: {item.planLabel || item.planId || '—'}
                </Text>
                <Text style={styles.price}>
                  Giá: {item.price?.toLocaleString('vi-VN') || 0} {item.currency || 'VND'}
                </Text>
                <Text style={styles.time}>
                  Thời gian:{' '}
                  {item.createdAt?.seconds
                    ? new Date(item.createdAt.seconds * 1000).toLocaleString('vi-VN')
                    : '—'}
                </Text>
              </View>

              <View style={styles.statusWrapper}>
                <Text
                  style={[
                    styles.status,
                    item.status === 'success' ? styles.ok : styles.fail,
                  ]}
                >
                  {item.status?.toUpperCase()}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 4,
          }}
        >
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.title}>Giao dịch &amp; Nâng cấp</Text>

        <View style={{ width: 40 }} />
      </View>

      {renderContent()}

      {/* Bottom sheet */}
      <TransactionDetailSheet
        visible={showDetail}
        item={selectedItem}
        onClose={closeDetail}
        onUpgrade={() => {
          if (selectedItem) updatePremiumFromTx(selectedItem);
        }}
        onCancel={() => {
          if (selectedItem) cancelPremiumFromTx(selectedItem);
        }}
      />
    </SafeAreaView>
  );
}
