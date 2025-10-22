export type VocabQuestion = {
  id: string;
  word: string;
  meaning: string; // nghĩa đúng
  pos?: 'n' | 'v' | 'adj' | 'adv' | 'phr';
  level?: 'A1'|'A2'|'B1'|'B2'|'C1'|'C2';
};
