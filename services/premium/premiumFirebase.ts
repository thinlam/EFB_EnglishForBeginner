// services/premiumFirebase.ts
import { db } from '@/scripts/firebase'; // tùy project bạn
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

interface SavePremiumParams {
  userId: string;
  planId: 'monthly' | 'yearly' | 'lifetime';
  transactionId: string;
  platform: 'android' | 'ios';
  expiresAt?: Date | null;
  paymentMethod: 'iap' | 'momo' | 'zalo' | 'credit_card' | 'other';
}

export async function savePremiumToFirestore(params: SavePremiumParams) {
  const { userId, planId, transactionId, platform, expiresAt, paymentMethod } = params;

  const userRef = doc(db, 'users', userId);
  const paymentsRef = doc(db, 'users', userId, 'payments', transactionId);

  const premiumData = {
    isPremium: true,
    premiumPlanId: planId,
    premiumSource: paymentMethod,
    premiumPlatform: platform,
    premiumUpdatedAt: serverTimestamp(),
    premiumExpiresAt: expiresAt ? expiresAt.toISOString() : null,
  };

  // cập nhật flag premium cho user
  await setDoc(userRef, {
  isPremium: true,
  premiumPlanId: planId,
  // ...
}, { merge: true });    
  // log giao dịch
  await setDoc(paymentsRef, {
    transactionId,
    planId,
    platform,
    paymentMethod,
    createdAt: serverTimestamp(),
    expiresAt: premiumData.premiumExpiresAt,
  });
}
