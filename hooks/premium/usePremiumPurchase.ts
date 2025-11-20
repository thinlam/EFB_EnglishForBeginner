// hooks/premium/usePremiumPurchase.ts
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { useState } from 'react';
import { Alert } from 'react-native';

import { PREMIUM_PLANS } from '@/constants/Premium/premium';
import { auth, db } from '@/scripts/firebase';
import type { PremiumPlanId } from '@/types/Premium/premium';

/** Tính ngày hết hạn theo gói */
function calcExpireDate(planId: PremiumPlanId): Date {
  const d = new Date();

  if (planId === 'monthly') {
    d.setMonth(d.getMonth() + 1);
  } else if (planId === 'yearly') {
    d.setFullYear(d.getFullYear() + 1);
  }

  return d;
}

type PurchaseOptions = {
  onSuccess?: () => void;
};

export function usePremiumPurchase() {
  const [loading, setLoading] = useState(false);

  const purchasePremium = async (
    planId: PremiumPlanId,
    options?: PurchaseOptions
  ) => {
    if (loading) return;

    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to purchase Premium.');
      return;
    }

    const plan = PREMIUM_PLANS.find((p) => p.id === planId);
    if (!plan) {
      Alert.alert('Error', 'Plan not found.');
      return;
    }

    try {
      setLoading(true);

      const userRef = doc(db, 'users', user.uid);
      const expireAt = calcExpireDate(planId);

      // ✅ Ghi trực tiếp premium vào user doc
      await setDoc(
        userRef,
        {
          premium: true,
          isPremium: true,
          premiumPlanId: plan.id,
          premiumPlanLabel: plan.label,
          premiumPrice: plan.price,
          premiumCurrency: plan.currency,
          premiumUpdatedAt: serverTimestamp(), // thời điểm nâng cấp
          premiumExpiresAt: expireAt,          // thời điểm hết hạn
        },
        { merge: true }
      );

      // (optional) log giao dịch
      await addDoc(collection(db, 'premiumPurchases'), {
        userId: user.uid,
        email: user.email ?? null,
        planId: plan.id,
        planLabel: plan.label,
        price: plan.price,
        currency: plan.currency,
        createdAt: serverTimestamp(),
        expireAt,
        status: 'success',
      });

      Alert.alert(
        'Purchase successful',
        'Your Premium plan is now active. Enjoy your learning journey! 🎉'
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

      Alert.alert(
        'Payment failed',
        'Something went wrong. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  return { loading, purchasePremium };
}
