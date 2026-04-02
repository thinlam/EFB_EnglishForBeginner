// types/admin/transactionTypes.ts

export type Transaction = {
  id: string;
  userId: string;
  email: string | null;
  planId: 'monthly' | 'yearly' | string;
  planLabel: string;
  price: number;
  currency: string;
  status: 'success' | 'failed' | 'revoked' | string;
  createdAt: any; // Firestore Timestamp
  expireAt?: any; // Firestore Timestamp | undefined
};
