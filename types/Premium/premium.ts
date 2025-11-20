// types/premium.ts
export type PremiumPlanId = 'monthly' | 'yearly' | 'lifetime';

export type PremiumPlan = {
  id: PremiumPlanId;
  label: string;
  description: string;
  price: number;
  currency: string;
  highlight?: boolean;
  badge?: string;
  bestValue?: boolean;
};
