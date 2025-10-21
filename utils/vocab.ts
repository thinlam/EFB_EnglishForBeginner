import { getAllForNoise } from '@/services/vocab/sprint-source';

export function randBool(trueRate = 0.5): boolean {
  return Math.random() < trueRate;
}

export function pickOtherMeaning(excludeId: string): string {
  const bank = getAllForNoise();
  const others = bank.filter(q => q.id !== excludeId);
  const i = Math.floor(Math.random() * others.length);
  return others[i]?.meaning ?? '—';
}
