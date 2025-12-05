// hooks/premium/usePremiumPurchase.ts

import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { useState } from 'react';
import { Alert } from 'react-native';

import { auth, db } from '@/scripts/firebase';
import type { PremiumPlan } from '@/types/Premium/premium';

/** Tính ngày hết hạn dựa trên "duration" (số ngày) từ Firestore */
function calcExpireDate(duration?: number): Date | null {
  if (!duration || duration <= 0) return null;

  const d = new Date();
  d.setDate(d.getDate() + duration);
  return d;
}

type PurchaseOptions = {
  onSuccess?: () => void;
};

export function usePremiumPurchase() {
  const [loading, setLoading] = useState(false);

  /**
   * Hàm mua Premium
   * @param planId - ID document Firestore
   */
  const purchasePremium = async (planId: string, options?: PurchaseOptions) => {
    if (loading) return;

    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để nâng cấp Premium.');
      return;
    }

    try {
      setLoading(true);

      // 🔥 Lấy dữ liệu gói Premium từ Firestore
      const planSnap = await getDoc(doc(db, 'premium_plans', planId));
      if (!planSnap.exists()) {
        Alert.alert('Lỗi', 'Gói Premium không tồn tại.');
        return;
      }

      const plan = planSnap.data() as PremiumPlan;

      const expireAt = calcExpireDate(plan.duration);

      const userRef = doc(db, 'users', user.uid);

      // 🔥 Cập nhật Premium vào user document
      await setDoc(
        userRef,
        {
          premium: true,
          isPremium: true,
          role: 'premium',
          premiumPlanId: planId,
          premiumPlanLabel: plan.label,
          premiumPrice: plan.price,
          premiumCurrency: plan.currency,
          premiumUpdatedAt: serverTimestamp(),
          premiumExpiresAt: expireAt ?? null,
        },
        { merge: true }
      );

      // 🔥 Ghi log lịch sử giao dịch
      await addDoc(collection(db, 'premiumPurchases'), {
        userId: user.uid,
        email: user.email ?? null,
        planId,
        planLabel: plan.label,
        price: plan.price,
        currency: plan.currency,
        duration: plan.duration ?? null,
        createdAt: serverTimestamp(),
        expireAt: expireAt ?? null,
        status: 'success',
      });

      Alert.alert(
        'Thành công 🎉',
        `Bạn đã nâng cấp gói ${plan.label}.`
      );

      options?.onSuccess?.();
    } catch (error: any) {
      console.error('purchasePremium error:', error);

      try {
        await addDoc(collection(db, 'premiumPurchases'), {
          userId: auth.currentUser?.uid ?? null,
          planId,
          errorMessage: error?.message ?? 'Unknown error',
          createdAt: serverTimestamp(),
          status: 'failed',
        });
      } catch {
        // ignore
      }

      Alert.alert('Thanh toán thất bại', 'Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return { loading, purchasePremium };
}
