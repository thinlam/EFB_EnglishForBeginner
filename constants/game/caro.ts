export const CARO_LEVELS = [
  {
    index: 1,
    goal: 'Thắng 1 ván.',
    t1Moves: 8,   // 2 sao nếu ≤ 8 lượt O
    t2Moves: 5,   // 3 sao nếu ≤ 5 lượt O + P%
    passPct: 70,  // P% đúng AV cho 3 sao
    quizTimeSec: 15,
    botDifficulty: 1,
    requireText: 'Mặc định mở',
  },
  {
    index: 2,
    goal: 'Thắng nhanh, hạn chế nước đi.',
    t1Moves: 7,
    t2Moves: 4,
    passPct: 75,
    quizTimeSec: 15,
    botDifficulty: 2,
    requireText: 'Mở khi Level 1 ≥ 1 sao',
  },
  // ... tiếp tục
] as const;
