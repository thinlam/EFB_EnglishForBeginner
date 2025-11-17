// types/premium.ts
export type PremiumPlanId = 'monthly' | 'yearly' | 'lifetime';

export interface PremiumPlan {
  id: PremiumPlanId;
  title: string;
  priceLabel: string;
  badge?: string;
  description?: string;
}
