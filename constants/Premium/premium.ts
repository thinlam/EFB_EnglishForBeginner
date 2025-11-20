// constants/Premium/premium.ts
import type { PremiumPlan } from '@/types/Premium/premium';

export const PREMIUM_BENEFITS: string[] = [
  'Không quảng cáo trong quá trình học',
  'Mở khóa tất cả bài học & trò chơi',
  'Lộ trình học cá nhân hoá theo cấp độ',
  'Ưu tiên cập nhật tính năng mới',
  'Hỗ trợ kỹ thuật nhanh hơn',
];

export const PREMIUM_PLANS: PremiumPlan[] = [
  {
    id: 'monthly',
    label: 'Monthly Premium',
    description: 'Thanh toán theo tháng, linh hoạt, có thể hủy bất kỳ lúc nào.',
    price: 59000,
    currency: 'VND',
    badge: 'Popular',
  },
  {
    id: 'yearly',
    label: 'Yearly Premium',
    description: 'Tiết kiệm hơn so với trả theo tháng, phù hợp học lâu dài.',
    price: 499000,
    currency: 'VND',
    highlight: true,
    bestValue: true,
    badge: 'Best Value',
  },
];
