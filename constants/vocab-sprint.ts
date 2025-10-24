export const SPRINT = {
  DURATION_SEC: 60,
  HEARTS: 3,
  POINT_PER_CORRECT: 10,
  MATCH_RATE: 0.5, // tỷ lệ hiển thị nghĩa đúng
};

export const STREAK_BONUS: Record<number | 'DEFAULT', number> = {
  1: 0, 2: 2, 3: 4, 4: 6, 5: 8,
  DEFAULT: 10, // >=6
};
