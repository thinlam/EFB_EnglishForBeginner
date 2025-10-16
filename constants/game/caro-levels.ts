export type CaroLevel = {
  index: number;
  goal: string;           // mô tả ngắn
  botDifficulty: number;  // 1..5 (hiện để dành)
  t1Moves: number;        // gợi ý yêu cầu lượt tối đa (tuỳ em dùng)
  t2Moves: number;
  passPct: number;        // yêu cầu tỷ lệ đúng tối thiểu
};

export const CARO_LEVELS: readonly CaroLevel[] = Array.from({ length: 100 }, (_, i) => {
  const idx = i + 1;
  return {
    index: idx,
    goal: idx === 1 ? 'Thắng 1 ván' : 'Thắng nhanh & chính xác',
    botDifficulty: Math.min(1 + Math.floor(idx / 10), 5), // tăng dần
    t1Moves: Math.max(10 - Math.floor(idx / 10), 3), // giảm dần
    t2Moves: Math.max(7 - Math.floor(idx / 15), 2), // giảm dần
    passPct: Math.min(50 + Math.floor(idx / 2), 90), // tăng dần
  };
});
