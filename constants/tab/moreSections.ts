export type Item = { icon: string; title: string; sub?: string; path?: string; danger?: boolean };

export const sections: { heading: string; items: Item[] }[] = [
  {
    heading: 'Học tập',
    items: [
      { icon: 'calendar-alt', title: 'Lịch học & Kế hoạch', sub: 'Mục tiêu ngày/tuần, nhắc lịch', path: '/studyPlan' },
      { icon: 'medal', title: 'Thành tích & Huy hiệu', sub: 'Điểm, badges, bảng xếp hạng', path: '/achievements' },
    ],
  },
  {
    heading: 'Gói dịch vụ',
    items: [
      { icon: 'crown', title: 'Nâng cấp Premium', sub: 'Bài nâng cao, không quảng cáo', path: '/Premium' },
      { icon: 'receipt', title: 'Quản lý gói', sub: 'Gia hạn, lịch sử thanh toán', path: '/subscription' },
    ],
  },
  {
    heading: 'Ứng dụng',
    items: [
      { icon: 'cog', title: 'Cài đặt ứng dụng', sub: 'Ngôn ngữ, giao diện, tải xuống', path: '/settings' },
      { icon: 'envelope', title: 'Góp ý / Liên hệ', sub: 'Hỗ trợ kỹ thuật & phản hồi', path: '/support' },
    ],
  },
];
