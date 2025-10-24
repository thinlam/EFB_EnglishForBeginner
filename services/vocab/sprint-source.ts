import type { VocabQuestion } from '@/types/vocab';

// Demo local bank; sau này thay bằng Firestore/REST
const BANK: VocabQuestion[] = [
  { id: '1', word: 'achievement', meaning: 'thành tựu', pos: 'n', level: 'B1' },
  { id: '2', word: 'affordable', meaning: 'hợp túi tiền', pos: 'adj', level: 'A2' },
  { id: '3', word: 'reliable', meaning: 'đáng tin cậy', pos: 'adj', level: 'B1' },
  { id: '4', word: 'maintain', meaning: 'duy trì', pos: 'v', level: 'B1' },
  { id: '5', word: 'underestimate', meaning: 'đánh giá thấp', pos: 'v', level: 'B2' },
  { id: '6', word: 'Revenue', meaning: 'doanh thu', pos: 'n', level: 'B1' },
  { id: '7', word: 'enthusiastic', meaning: 'nhiệt huyết', pos: 'adj', level: 'B1' },
  { id: '8', word: 'deadline', meaning: 'hạn chót', pos: 'n', level: 'A2' },
  { id: '9', word: 'collaborate', meaning: 'hợp tác', pos: 'v', level: 'B2' },
  { id: '10', word: 'efficient', meaning: 'hiệu quả', pos: 'adj', level: 'B1' },
];

export async function getRandomQuestion(): Promise<VocabQuestion> {
  const i = Math.floor(Math.random() * BANK.length);
  // mô phỏng fetch
  await new Promise(r => setTimeout(r, 60));
  return BANK[i];
}

export function getAllForNoise(): VocabQuestion[] {
  return BANK;
}
