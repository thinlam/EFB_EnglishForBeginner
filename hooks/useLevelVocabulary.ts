// hooks/useLevelVocabulary.ts

import { ALL_VOCABULARY, VOCAB_TOPICS } from '@/constants/vocab';

type LevelKey = keyof typeof ALL_VOCABULARY;

// Lấy shape 1 từ bất kỳ (ở đây dùng A1)
export type VocabWord = (typeof ALL_VOCABULARY)['A1'][number];

const LEVEL_MAP: Record<string, LevelKey> = {
  '1': 'A1',
//   '2': 'A2',
//   '3': 'B1',
//   '4': 'B2',
//   '5': 'C1',
//   '6': 'C2',

  A1: 'A1',
//   A2: 'A2',
//   B1: 'B1',
//   B2: 'B2',
//   C1: 'C1',
//   C2: 'C2',
};

export function getVocabByLevel(rawLevel: any) {
  const normalized = String(rawLevel ?? '')
    .toUpperCase()
    .trim();

  const key: LevelKey = LEVEL_MAP[normalized] ?? 'A1';

  const vocab = (ALL_VOCABULARY[key] ?? []) as unknown as VocabWord[];
  const topics = VOCAB_TOPICS[key] ?? [];

  return { vocab, topics, cefrLevel: key };
}
