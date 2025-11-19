// constants/vocab/words-A1.ts

export const WORDS_A1 = [
  {
  id: 'A1-001',
  word: 'hello',
  phonetic: '/həˈləʊ/',
  meaningVi: 'xin chào',
  exampleEn: 'Hello, how are you?',
  exampleVi: 'Xin chào, bạn khỏe không?',
  topic: 'Greetings',
  pos: 'thán từ',
}
,  
  {
  id: 'A1-002',
  word: 'family',
  phonetic: '/ˈfæməli/',
  meaningVi: 'gia đình',

  // 👉 Từ loại (POS)
  pos: 'noun', // danh từ

  // 👉 Ví dụ
  exampleEn: 'My family is big.',
  exampleVi: 'Gia đình của tôi lớn.',

  // 👉 Chủ đề
  topic: 'Family',

  // 👉 Thời gian tạo
  createdAt: '2025-05-20T08:10:00Z',
},
  {
    id: 'A1-003',
    word: 'teacher',
    phonetic: '/ˈtiː.tʃər/',
    meaningVi: 'giáo viên',
    exampleEn: 'The teacher is nice.',
    exampleVi: 'Giáo viên rất tốt.',
    topic: 'School',
    createdAt: '2025-05-20T08:20:00Z',
  },
   {
    id: 'A1-004',
    word: 'eat',
    phonetic: '/iːt/',
    meaningVi: 'ăn',
    pos: 'verb',

    forms: {
      base: 'eat',
      thirdPerson: 'eats',
      presentParticiple: 'eating',
      past: 'ate',
      pastParticiple: 'eaten',
    },

    exampleEn: 'I eat breakfast at 7 AM.',
    exampleVi: 'Tôi ăn sáng lúc 7 giờ.',
    topic: 'Food & Drinks',
    createdAt: '2025-05-20T08:30:00Z',
  },
  {
    id: 'A1-005',
    word: 'blue',
    phonetic: '/bluː/',
    meaningVi: 'màu xanh dương',
    exampleEn: 'The sky is blue.',
    exampleVi: 'Bầu trời có màu xanh dương.',
    topic: 'Colors',
    createdAt: '2025-05-20T08:40:00Z',
  },
] as const;
