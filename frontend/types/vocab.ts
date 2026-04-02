
export type VerbForms = {
  base: string;
  thirdPerson: string;
  presentParticiple: string;
  past: string;
  pastParticiple: string;
};

export type IdiomItem = {
  phrase: string;      // cụm từ / thành ngữ
  meaning: string;     // nghĩa tiếng Việt
  exampleEn?: string;
  exampleVi?: string;
};

export type MeaningItem = {
  definition: string;  // nghĩa tiếng Việt
  exampleEn?: string;
  exampleVi?: string;
};

export type VocabEntry = {
  pos: string;                 // noun / verb / adjective / adverb / phrase...
  forms?: VerbForms;           // chỉ dùng cho động từ
  meanings: MeaningItem[];     // nhiều nghĩa
  idioms?: IdiomItem[];        // thành ngữ / collocation liên quan
};

export type VocabItem = {
  id: string;
  word: string;                // headword (có thể là phrase)
  phonetic?: string;
  entries: VocabEntry[];       // một từ có thể nhiều từ loại
  topic: string;
  createdAt: string;
};

