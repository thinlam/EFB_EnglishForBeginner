// types/premium.ts

// types/premium.ts

export type PremiumPlan = {
  id: string;                // ID của document Firestore
  label: string;             // Tên gói (Monthly, Yearly, Lifetime...)
  description?: string;      // Mô tả ngắn
  price: number;             // Giá gốc
  currency: string;          // "VND" | "USD" | ...
  sale?: number;             // % giảm giá (0–100)
  duration?: number;         // Thời gian sử dụng (ngày), ví dụ: 30, 365, 9999
  highlight?: boolean;       // Đánh dấu để nổi bật gói
  badge?: string;            // Ribbon như "Best", "Hot"
  bestValue?: boolean;       // đánh dấu gói giá trị tốt nhất
  isActive?: boolean;        // admin bật/tắt gói
  createdAt?: any;           // Timestamp Firestore
};


