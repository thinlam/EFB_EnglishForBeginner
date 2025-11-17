import { PremiumPlanId } from '@/types/Premium/premium';
import { Alert } from 'react-native';

export async function requestPremiumPurchase(planId: PremiumPlanId) {
  // Thông báo cho user biết đang fake
  Alert.alert('Dev mode', `Giả lập thanh toán gói: ${planId}.`);

  // Trả về 1 object giống purchase để lưu Firestore
  return {
    productId: `dev_${planId}`,
    transactionId: `dev_txn_${Date.now()}`,
  };
}

// Giữ API cho giống bản thật, nhưng không làm gì
export async function finishTransactionSafe(_purchase: any) {
  return;
}