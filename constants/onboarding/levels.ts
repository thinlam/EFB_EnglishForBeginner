export const STAR_TO_CEFR: Record<number, 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'> = {
  1: 'A1',
  2: 'A2',
  3: 'B1',
  4: 'B2',
  5: 'C1',
  // 6: 'C2',
};

export const levels = [
  { id: 1, stars: 1, label: 'Tôi mới học tiếng Anh' },
  { id: 2, stars: 2, label: 'Tôi biết vài từ thông dụng' },
  { id: 3, stars: 3, label: 'Tôi có thể giao tiếp cơ bản' },
  { id: 4, stars: 4, label: 'Tôi có thể nói và viết nhiều chủ đề' },
  { id: 5, stars: 5, label: 'Tôi có thể hiểu đa số chủ đề' },
  // { id: 6, stars: 6, label: 'Tôi gần như thành thạo (C2)' },
];

export const levelMessages: Record<number, string> = {
  1: '✨ Cùng học từ căn bản để tạo nền tảng vững chắc!',
  2: '📚 Trình độ sơ khởi – bạn sẽ tiến bộ rất nhanh!',
  3: '💬 Giao tiếp cơ bản – bắt đầu thực hành ngay thôi!',
  4: '🧠 Bạn đã có nền – hãy đào sâu và hoàn thiện!',
  5: '🚀 Bạn gần như thành thạo – chỉ cần tinh chỉnh thêm thôi!',
  // 6: '🏆 C2 – duy trì phong độ và luyện kỹ năng nâng cao!',
};
