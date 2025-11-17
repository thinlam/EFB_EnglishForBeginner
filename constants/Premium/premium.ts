// constants/premium.ts
import { PremiumPlan } from '@/types/Premium/premium';

export const PREMIUM_BENEFITS: string[] = [
  'Không quảng cáo trong suốt quá trình học',
  'Mở khóa tất cả bài học Listening & Reading',
  'Truy cập toàn bộ mini-game (Caro, Sprint, v.v.)',
  'X2 EXP mỗi ngày để lên level nhanh hơn',
  'Luyện đề & bài test không giới hạn số lượt',
  'Tải nội dung quan trọng để học offline',
  'Thống kê tiến độ học chi tiết theo ngày/tuần',
  'Tự động đồng bộ tiến trình trên cloud',
];

export const PREMIUM_PLANS: PremiumPlan[] = [
  {
    id: 'monthly',
    title: 'Gói tháng',
    priceLabel: '59.000đ / tháng',
    description: 'Linh hoạt, có thể hủy bất kỳ lúc nào.',
  },
  {
    id: 'yearly',
    title: 'Gói năm',
    priceLabel: '399.000đ / năm',
    badge: 'Tiết kiệm nhất',
    description: 'Tiết kiệm hơn so với gói tháng, phù hợp học lâu dài.',
  },
  {
    id: 'lifetime',
    title: 'Trọn đời',
    priceLabel: '699.000đ / một lần',
    description: 'Thanh toán 1 lần, sử dụng trọn đời.',
  },
];
