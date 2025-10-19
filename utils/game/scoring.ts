import type { EndStats } from '@/types/game/caro';

export function calcStarsAndExp(stats: EndStats): { stars: 0|1|2|3; exp: number } {
  const acc = stats.total ? stats.correct / stats.total : 0;
  let stars: 0|1|2|3 = 0;
  if (acc >= 0.9 || stats.maxStreak >= 5) stars = 3;
  else if (acc >= 0.75) stars = 2;
  else if (acc >= 0.5) stars = 1;
  const exp = Math.round(stats.correct * 10 + stats.maxStreak * 5 + acc * 20);
  return { stars, exp };
}
