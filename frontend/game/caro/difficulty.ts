// game/caro/difficulty.ts
export type Difficulty = 'easy' | 'medium' | 'hard' | 'boss';
export const BOSS_EVERY = 10;

export function isBossLevel(level: number) {
  return level > 0 && level % BOSS_EVERY === 0;
}

/** 1–3: easy, 4–6: medium, 7–9: hard, 10: boss; lặp lại cho 11..20, 21..30... */
export function difficultyFromLevel(level: number): Difficulty {
  if (isBossLevel(level)) return 'boss';
  const pos = level % BOSS_EVERY; // 1..9
  if (pos <= 3) return 'easy'; // 1,2,3
  if (pos <= 6) return 'medium'; // 4,5,6
  return 'hard';
}

/** Gợi ý tinh chỉnh thời gian/ thưởng theo độ khó */
export function levelTuning(level: number) {
  const difficulty = difficultyFromLevel(level);
  const baseTime = 15; // giây
  const timeLimit =
    difficulty === 'easy' ? baseTime :
    difficulty === 'medium' ? baseTime - 2 :
    difficulty === 'hard' ? baseTime - 4 :
    baseTime - 5; // boss nhanh hơn
  const reward =
    difficulty === 'easy' ? 10 : // điểm kinh nghiệm
    difficulty === 'medium' ? 15 :
    difficulty === 'hard' ? 20 : 40;
  return { difficulty, isBoss: isBossLevel(level), timeLimit: Math.max(8, timeLimit), reward };
}
