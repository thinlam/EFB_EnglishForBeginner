import { VocabItem } from "@/types/vocab";

export const WORDS_A1: readonly VocabItem[] = [
  // --------------------------------
  // GREETINGS
  // --------------------------------
  {
    id: 'A1-001',
    word: 'hello',
    phonetic: '/həˈləʊ/',
    topic: 'Greetings',
    createdAt: '2025-05-20T08:00:00Z',
    entries: [
      {
        pos: 'interjection',
        meanings: [
          {
            definition: 'xin chào',
            exampleEn: 'Hello, how are you?',
            exampleVi: 'Xin chào, bạn khỏe không?',
          },
        ],
        idioms: [
          {
            phrase: 'say hello to someone',
            meaning: 'chào hỏi ai đó',
            exampleEn: 'Please say hello to your parents for me.',
            exampleVi: 'Nhớ gửi lời chào ba mẹ bạn giùm mình nhé.',
          },
        ],
      },
    ],
  },

  {
    id: 'A1-002',
    word: 'hi',
    phonetic: '/haɪ/',
    topic: 'Greetings',
    createdAt: '2025-05-20T08:02:00Z',
    entries: [
      {
        pos: 'interjection',
        meanings: [
          {
            definition: 'chào (thân mật)',
            exampleEn: 'Hi, nice to meet you!',
            exampleVi: 'Chào, rất vui được gặp bạn!',
          },
        ],
      },
    ],
  },

  {
    id: 'A1-003',
    word: 'good morning',
    phonetic: '/ˌɡʊd ˈmɔː.nɪŋ/',
    topic: 'Greetings',
    createdAt: '2025-05-20T08:04:00Z',
    entries: [
      {
        pos: 'phrase',
        meanings: [
          {
            definition: 'chào buổi sáng',
            exampleEn: 'Good morning, class.',
            exampleVi: 'Chào buổi sáng cả lớp.',
          },
        ],
      },
    ],
  },

  {
    id: 'A1-004',
    word: 'good afternoon',
    phonetic: '/ˌɡʊd ˌɑːf.təˈnuːn/',
    topic: 'Greetings',
    createdAt: '2025-05-20T08:06:00Z',
    entries: [
      {
        pos: 'phrase',
        meanings: [
          {
            definition: 'chào buổi chiều',
            exampleEn: 'Good afternoon, everyone.',
            exampleVi: 'Chào buổi chiều mọi người.',
          },
        ],
      },
    ],
  },
  {
    id: 'A1-005',
    word: 'good evening',
    phonetic: '/ˌɡʊd ˈiːvnɪŋ/',
    topic: 'Greetings',
    createdAt: '2025-05-20T08:08:00Z',
    entries: [
      {
        pos: 'phrase',
        meanings: [
          {
            definition: 'chào buổi tối',
            exampleEn: 'Good evening, how was your day?',
            exampleVi: 'Chào buổi tối, ngày của bạn thế nào?',
          },
        ],
      },
    ],
  },


  // --------------------------------
  // FAMILY
  // --------------------------------
  {
    id: 'A1-010',
    word: 'family',
    phonetic: '/ˈfæməli/',
    topic: 'Family',
    createdAt: '2025-05-20T08:10:00Z',
    entries: [
      {
        pos: 'noun',
        meanings: [
          {
            definition: 'gia đình, gia quyến',
            exampleEn: 'My family is big.',
            exampleVi: 'Gia đình của tôi lớn.',
          },
          {
            definition: 'con cái trong gia đình',
            exampleEn: 'They have a small family.',
            exampleVi: 'Họ có ít con.',
          },
          {
            definition: 'dòng dõi, gia thế',
            exampleEn: 'He comes from a rich family.',
            exampleVi: 'Anh ấy xuất thân từ một gia đình giàu có.',
          },
        ],
        idioms: [
          {
            phrase: 'in the family way',
            meaning: 'theo cách gia đình',
          },
          {
            phrase: 'run in the family',
            meaning: 'là đặc điểm lưu truyền trong gia đình',
            exampleEn: 'Artistic talent runs in the family.',
            exampleVi: 'Năng khiếu nghệ thuật là đặc điểm di truyền trong gia đình họ.',
          },
        ],
      },
    ],
  },

  {
    id: 'A1-011',
    word: 'mother',
    phonetic: '/ˈmʌðər/',
    topic: 'Family',
    createdAt: '2025-05-20T08:12:00Z',
    entries: [
      {
        pos: 'noun',
        meanings: [
          {
            definition: 'mẹ',
            exampleEn: 'My mother is a doctor.',
            exampleVi: 'Mẹ tôi là bác sĩ.',
          },
        ],
      },
    ],
  },

  {
    id: 'A1-012',
    word: 'father',
    phonetic: '/ˈfɑː.ðər/',
    topic: 'Family',
    createdAt: '2025-05-20T08:14:00Z',
    entries: [
      {
        pos: 'noun',
        meanings: [
          {
            definition: 'bố, cha',
            exampleEn: 'His father works in a factory.',
            exampleVi: 'Cha của cậu ấy làm việc trong một nhà máy.',
          },
        ],
      },
    ],
  },

  // --------------------------------
  // SCHOOL
  // --------------------------------
  {
    id: 'A1-020',
    word: 'teacher',
    phonetic: '/ˈtiː.tʃər/',
    topic: 'School',
    createdAt: '2025-05-20T08:20:00Z',
    entries: [
      {
        pos: 'noun',
        meanings: [
          {
            definition: 'giáo viên',
            exampleEn: 'The teacher is kind and helpful.',
            exampleVi: 'Giáo viên rất tốt bụng và hay giúp đỡ.',
          },
        ],
      },
    ],
  },

  {
    id: 'A1-021',
    word: 'student',
    phonetic: '/ˈstjuː.dənt/',
    topic: 'School',
    createdAt: '2025-05-20T08:22:00Z',
    entries: [
      {
        pos: 'noun',
        meanings: [
          {
            definition: 'học sinh, sinh viên',
            exampleEn: 'I am a student at a high school.',
            exampleVi: 'Tôi là học sinh cấp ba.',
          },
        ],
      },
    ],
  },

  {
    id: 'A1-022',
    word: 'school',
    phonetic: '/skuːl/',
    topic: 'School',
    createdAt: '2025-05-20T08:24:00Z',
    entries: [
      {
        pos: 'noun',
        meanings: [
          {
            definition: 'trường học',
            exampleEn: 'Our school is big and beautiful.',
            exampleVi: 'Trường của chúng tôi lớn và đẹp.',
          },
        ],
      },
    ],
  },

  // --------------------------------
  // DAILY ACTIVITIES
  // --------------------------------
  {
    id: 'A1-030',
    word: 'get up',
    phonetic: '/ˈɡet ʌp/',
    topic: 'Daily Activities',
    createdAt: '2025-05-20T08:30:00Z',
    entries: [
      {
        pos: 'phrasal verb',
        meanings: [
          {
            definition: 'thức dậy, ra khỏi giường',
            exampleEn: 'I get up at 6 a.m. every day.',
            exampleVi: 'Tôi thức dậy lúc 6 giờ sáng mỗi ngày.',
          },
        ],
      },
    ],
  },

  {
    id: 'A1-031',
    word: 'go to school',
    phonetic: '/ˌɡəʊ tə ˈskuːl/',
    topic: 'Daily Activities',
    createdAt: '2025-05-20T08:32:00Z',
    entries: [
      {
        pos: 'phrase',
        meanings: [
          {
            definition: 'đi học',
            exampleEn: 'The children go to school by bus.',
            exampleVi: 'Bọn trẻ đi học bằng xe buýt.',
          },
        ],
      },
    ],
  },

  {
    id: 'A1-032',
    word: 'watch TV',
    phonetic: '/ˌwɒtʃ ˌtiːˈviː/',
    topic: 'Daily Activities',
    createdAt: '2025-05-20T08:34:00Z',
    entries: [
      {
        pos: 'phrase',
        meanings: [
          {
            definition: 'xem tivi',
            exampleEn: 'I watch TV in the evening.',
            exampleVi: 'Tôi xem tivi vào buổi tối.',
          },
        ],
      },
    ],
  },

  // --------------------------------
  // FOOD & DRINKS
  // --------------------------------
  {
    id: 'A1-040',
    word: 'eat',
    phonetic: '/iːt/',
    topic: 'Food & Drinks',
    createdAt: '2025-05-20T08:40:00Z',
    entries: [
      {
        pos: 'verb',
        forms: {
          base: 'eat',
          thirdPerson: 'eats',
          presentParticiple: 'eating',
          past: 'ate',
          pastParticiple: 'eaten',
        },
        meanings: [
          {
            definition: 'ăn',
            exampleEn: 'He cannot eat because of his serious toothache.',
            exampleVi: 'Vì quá đau răng, anh ta không thể ăn.',
          },
          {
            definition: 'ăn mòn, làm hỏng',
            exampleEn: 'Acids eat into metals.',
            exampleVi: 'Axit ăn mòn kim loại.',
          },
        ],
        idioms: [
          {
            phrase: 'eat up',
            meaning: 'ăn hết; ăn sạch',
          },
          {
            phrase: 'eat like a horse',
            meaning: 'ăn rất khỏe',
          },
        ],
      },
    ],
  },

  {
    id: 'A1-041',
    word: 'drink',
    phonetic: '/drɪŋk/',
    topic: 'Food & Drinks',
    createdAt: '2025-05-20T08:42:00Z',
    entries: [
      {
        pos: 'verb',
        forms: {
          base: 'drink',
          thirdPerson: 'drinks',
          presentParticiple: 'drinking',
          past: 'drank',
          pastParticiple: 'drunk',
        },
        meanings: [
          {
            definition: 'uống',
            exampleEn: 'I drink water every day.',
            exampleVi: 'Tôi uống nước mỗi ngày.',
          },
        ],
      },
    ],
  },

  {
    id: 'A1-042',
    word: 'rice',
    phonetic: '/raɪs/',
    topic: 'Food & Drinks',
    createdAt: '2025-05-20T08:44:00Z',
    entries: [
      {
        pos: 'noun',
        meanings: [
          {
            definition: 'cơm; gạo',
            exampleEn: 'We eat rice for lunch.',
            exampleVi: 'Chúng tôi ăn cơm vào bữa trưa.',
          },
        ],
      },
    ],
  },

  // --------------------------------
  // CLOTHES
  // --------------------------------
  {
    id: 'A1-050',
    word: 'shirt',
    phonetic: '/ʃɜːt/',
    topic: 'Clothes',
    createdAt: '2025-05-20T08:50:00Z',
    entries: [
      {
        pos: 'noun',
        meanings: [
          {
            definition: 'áo sơ mi',
            exampleEn: 'He is wearing a blue shirt.',
            exampleVi: 'Anh ấy đang mặc một chiếc áo sơ mi xanh.',
          },
        ],
      },
    ],
  },

  {
    id: 'A1-051',
    word: 'dress',
    phonetic: '/dres/',
    topic: 'Clothes',
    createdAt: '2025-05-20T08:52:00Z',
    entries: [
      {
        pos: 'noun',
        meanings: [
          {
            definition: 'váy liền thân (đầm)',
            exampleEn: 'She likes wearing a red dress.',
            exampleVi: 'Cô ấy thích mặc một chiếc váy đỏ.',
          },
        ],
      },
    ],
  },

  {
    id: 'A1-052',
    word: 'shoes',
    phonetic: '/ʃuːz/',
    topic: 'Clothes',
    createdAt: '2025-05-20T08:54:00Z',
    entries: [
      {
        pos: 'noun (plural)',
        meanings: [
          {
            definition: 'giày',
            exampleEn: 'Take off your shoes, please.',
            exampleVi: 'Làm ơn cởi giày ra.',
          },
        ],
      },
    ],
  },

  // --------------------------------
  // WEATHER
  // --------------------------------
  {
    id: 'A1-060',
    word: 'sunny',
    phonetic: '/ˈsʌni/',
    topic: 'Weather',
    createdAt: '2025-05-20T09:00:00Z',
    entries: [
      {
        pos: 'adjective',
        meanings: [
          {
            definition: 'nắng, có nắng',
            exampleEn: 'Today is sunny and warm.',
            exampleVi: 'Hôm nay trời nắng và ấm.',
          },
        ],
      },
    ],
  },

  {
    id: 'A1-061',
    word: 'rainy',
    phonetic: '/ˈreɪ.ni/',
    topic: 'Weather',
    createdAt: '2025-05-20T09:02:00Z',
    entries: [
      {
        pos: 'adjective',
        meanings: [
          {
            definition: 'mưa, có mưa',
            exampleEn: 'It is rainy in the afternoon.',
            exampleVi: 'Buổi chiều trời có mưa.',
          },
        ],
      },
    ],
  },

  {
    id: 'A1-062',
    word: 'cold',
    phonetic: '/kəʊld/',
    topic: 'Weather',
    createdAt: '2025-05-20T09:04:00Z',
    entries: [
      {
        pos: 'adjective',
        meanings: [
          {
            definition: 'lạnh',
            exampleEn: 'It is very cold in winter.',
            exampleVi: 'Trời rất lạnh vào mùa đông.',
          },
        ],
      },
    ],
  },

  // --------------------------------
  // COLORS
  // --------------------------------
  {
    id: 'A1-070',
    word: 'blue',
    phonetic: '/bluː/',
    topic: 'Colors',
    createdAt: '2025-05-20T09:10:00Z',
    entries: [
      {
        pos: 'adjective',
        meanings: [
          {
            definition: 'màu xanh dương',
            exampleEn: 'The sky is blue.',
            exampleVi: 'Bầu trời có màu xanh dương.',
          },
        ],
      },
    ],
  },

  {
    id: 'A1-071',
    word: 'red',
    phonetic: '/red/',
    topic: 'Colors',
    createdAt: '2025-05-20T09:12:00Z',
    entries: [
      {
        pos: 'adjective',
        meanings: [
          {
            definition: 'màu đỏ',
            exampleEn: 'She is wearing a red dress.',
            exampleVi: 'Cô ấy đang mặc một chiếc váy đỏ.',
          },
        ],
      },
    ],
  },

  {
    id: 'A1-072',
    word: 'green',
    phonetic: '/ɡriːn/',
    topic: 'Colors',
    createdAt: '2025-05-20T09:14:00Z',
    entries: [
      {
        pos: 'adjective',
        meanings: [
          {
            definition: 'màu xanh lá cây',
            exampleEn: 'The grass is green.',
            exampleVi: 'Cỏ có màu xanh lá cây.',
          },
        ],
      },
    ],
  },

  // --------------------------------
  // JOBS
  // --------------------------------
  {
    id: 'A1-080',
    word: 'doctor',
    phonetic: '/ˈdɒk.tər/',
    topic: 'Jobs',
    createdAt: '2025-05-20T09:20:00Z',
    entries: [
      {
        pos: 'noun',
        meanings: [
          {
            definition: 'bác sĩ',
            exampleEn: 'Her mother is a doctor.',
            exampleVi: 'Mẹ cô ấy là bác sĩ.',
          },
        ],
      },
    ],
  },

  {
    id: 'A1-081',
    word: 'worker',
    phonetic: '/ˈwɜː.kər/',
    topic: 'Jobs',
    createdAt: '2025-05-20T09:22:00Z',
    entries: [
      {
        pos: 'noun',
        meanings: [
          {
            definition: 'công nhân, người lao động',
            exampleEn: 'He is a factory worker.',
            exampleVi: 'Anh ấy là công nhân nhà máy.',
          },
        ],
      },
    ],
  },

  {
    id: 'A1-082',
    word: 'teacher',
    phonetic: '/ˈtiː.tʃər/',
    topic: 'Jobs',
    createdAt: '2025-05-20T09:24:00Z',
    entries: [
      {
        pos: 'noun',
        meanings: [
          {
            definition: 'giáo viên',
            exampleEn: 'I want to be a teacher in the future.',
            exampleVi: 'Tôi muốn trở thành giáo viên trong tương lai.',
          },
        ],
      },
    ],
  },

  // --------------------------------
  // NUMBERS
  // --------------------------------
  {
    id: 'A1-090',
    word: 'one',
    phonetic: '/wʌn/',
    topic: 'Numbers',
    createdAt: '2025-05-20T09:30:00Z',
    entries: [
      {
        pos: 'number',
        meanings: [
          {
            definition: 'một',
            exampleEn: 'I have one brother.',
            exampleVi: 'Tôi có một người anh/em trai.',
          },
        ],
      },
    ],
  },

  {
    id: 'A1-091',
    word: 'two',
    phonetic: '/tuː/',
    topic: 'Numbers',
    createdAt: '2025-05-20T09:32:00Z',
    entries: [
      {
        pos: 'number',
        meanings: [
          {
            definition: 'hai',
            exampleEn: 'She has two cats.',
            exampleVi: 'Cô ấy có hai con mèo.',
          },
        ],
      },
    ],
  },

  {
    id: 'A1-092',
    word: 'ten',
    phonetic: '/ten/',
    topic: 'Numbers',
    createdAt: '2025-05-20T09:34:00Z',
    entries: [
      {
        pos: 'number',
        meanings: [
          {
            definition: 'mười',
            exampleEn: 'There are ten students in the room.',
            exampleVi: 'Có mười học sinh trong phòng.',
          },
        ],
      },
    ],
  },
] as const;