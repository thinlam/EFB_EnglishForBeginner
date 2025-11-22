// constants/vocab/index.ts

import { VOCAB_TOPICS } from './topics';
import { WORDS_A1 } from './words-A1';

// TODO: sau này import thêm WORDS_A2, WORDS_B1... ở đây
// import { WORDS_A2 } from './words-A2';

export const ALL_VOCABULARY = {
  A1: WORDS_A1,
//   A2: [] as unknown as typeof WORDS_A1,
//   B1: [] as typeof WORDS_A1,
//   B2: [] as typeof WORDS_A1,
//   C1: [] as typeof WORDS_A1,
//   C2: [] as typeof WORDS_A1,
} as const;

export { VOCAB_TOPICS };
