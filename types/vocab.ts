export type VocabQuestion = {
  id: string;
  word: string;
  meaning: string; // nghĩa đúng
  pos?: 'n' | 'v' | 'adj' | 'adv' | 'phr';
  level?: 'A1'|'A2'|'B1'|'B2'|'C1'|'C2';
};
export type VerbForms = {
  base: string;
  thirdPerson: string;
  presentParticiple: string;
  past: string;
  pastParticiple: string;
};

export type VocabItem = {
  id: string;
  word: string;
  phonetic: string;
  meaningVi: string;
  pos: string;
  exampleEn: string;
  exampleVi: string;
  topic: string;
  createdAt: string;
  forms?: VerbForms; // 👉 thêm dòng này
};

