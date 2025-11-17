// hooks/premium/usePremiumPurchase.ts
import { savePremiumToFirestore } from '@/services/premium/premiumFirebase';
import {
    finishTransactionSafe,
    requestPremiumPurchase,
} from '@/services/premium/premiumIAP';
import { PremiumPlanId } from '@/types/Premium/premium';
import { getAuth } from 'firebase/auth';
import { useState } from 'react';
import { Alert, Platform } from 'react-native';

const auth = getAuth();

export function usePremiumPurchase() {
  const [loading, setLoading] = useState(false);

  const handlePurchaseSuccess = async (purchase: any, planId: PremiumPlanId) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Thông báo', 'Bạn cần đăng nhập để nâng cấp Premium.');
        return;
      }

      const expiresAt = calcExpireDate(planId);

      await savePremiumToFirestore({
        userId: user.uid,
        planId,
        transactionId: purchase.transactionId,
        platform: Platform.OS === 'ios' ? 'ios' : 'android',
        paymentMethod: 'iap',
        expiresAt,
      });

      await finishTransactionSafe(purchase);

      Alert.alert('Thành công', 'Bạn đã nâng cấp Premium thành công!');

      setLoading(false);
    } catch (err) {
      console.error('handlePurchaseSuccess error', err);
      setLoading(false);
    }
  };

  const purchasePremium = async (planId: PremiumPlanId) => {
    try {
      setLoading(true);
      const purchase = await requestPremiumPurchase(planId);
      await handlePurchaseSuccess(purchase, planId);
    } catch (err: any) {
      console.error('purchasePremium error', err);
      setLoading(false);
      Alert.alert('Thanh toán thất bại', 'Vui lòng thử lại sau.');
    }
  };

  return {
    loading,
    purchasePremium,
  };
}

function calcExpireDate(planId: PremiumPlanId): Date | null {
  if (planId === 'lifetime') return null;
  const now = new Date();
  if (planId === 'monthly') {
    now.setMonth(now.getMonth() + 1);
  } else if (planId === 'yearly') {
    now.setFullYear(now.getFullYear() + 1);
  }
  return now;
}
