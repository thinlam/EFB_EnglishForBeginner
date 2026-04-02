// services/admin/premiumService.ts
import { auth, db } from '@/scripts/firebase';
import type { Transaction } from '@/types/admin/transactionTypes';
import { doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

export async function cancelPremiumFromTransaction(tx: Transaction) {
  if (!tx.userId) throw new Error('Missing userId in transaction');

  const userRef = doc(db, 'users', tx.userId);
  const adminUid = auth.currentUser?.uid ?? null;

  // 1. Gỡ toàn bộ flag premium ở user
  await setDoc(
    userRef,
    {
      role: 'user',            // hoặc 'free'
      premium: false,
      isPremium: false,
      premiumPlanId: null,
      premiumPlanLabel: null,
      premiumPrice: null,
      premiumCurrency: null,
      premiumExpiresAt: null,  // 👈 QUAN TRỌNG: xoá date đi
      premiumCanceledAt: serverTimestamp(),
      premiumCanceledReason: 'admin_cancel',
    },
    { merge: true }
  );

  // 2. Đánh dấu giao dịch bị thu hồi
  if (tx.id) {
    const txRef = doc(db, 'premiumPurchases', tx.id);
    await updateDoc(txRef, {
      status: 'revoked',
      revokedAt: serverTimestamp(),
      revokedByAdminId: adminUid,
    });
  }
}
