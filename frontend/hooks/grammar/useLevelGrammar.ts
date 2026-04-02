// hooks/useLevelGrammar.ts

export type GrammarPoint = {
  id: string;
  level: 'A1';
  title: string;
  summary: string;
  pattern: string;
  explanationVi: string;
  exampleEn: string;
  exampleVi: string;

  /** Mở rộng cho sau này (UI hiện tại chưa dùng nhưng để đó cho pro):
   *  - extraPatterns: thêm biến thể cấu trúc
   *  - extraExamples: thêm ví dụ luyện tập
   *  - notesVi: ghi chú / lưu ý
   */
  extraPatterns?: string[];
  extraExamples?: { exampleEn: string; exampleVi: string }[];
  notesVi?: string;
};

/**
 * A1 Grammar – bao phủ các điểm cốt lõi:
 * - To be
 * - Present Simple (+ / - / ?)
 * - Present Continuous
 * - Plural nouns, a/an/the
 * - Possessive adjectives & ’s
 * - Object pronouns
 * - There is / There are
 * - Can / Can’t
 * - Adverbs of frequency
 * - Like / love / hate + V-ing
 * - Imperatives
 * - This / That / These / Those
 * - Prepositions of place (in/on/under/next to…)
 * - Prepositions of time (in/on/at)
 * - Some / any
 * - Wh- questions cơ bản (What/Where/When/Who/How old)
 */

const GRAMMAR_A1: GrammarPoint[] = [
  {
    id: 'A1-G01',
    level: 'A1',
    title: 'Động từ “to be” – am / is / are',
    summary: 'Giới thiệu bản thân, nghề nghiệp, tính cách, nơi chốn.',
    pattern: 'Khẳng định: S + am / is / are + N/Adj\nPhủ định: S + am not / isn’t / aren’t + N/Adj\nNghi vấn: Am / Is / Are + S + N/Adj?',
    explanationVi:
      'Dùng “am/is/are” để nói tuổi, nghề nghiệp, nơi ở, tính cách, tình trạng. “I → am”, “he/she/it → is”, “we/you/they → are”. Câu phủ định thêm “not”. Câu hỏi đảo “am/is/are” lên đầu câu.',
    exampleEn:
      'I am a student. She is happy. They are in the classroom.\nI am not tired. He isn’t a doctor. Are you ready?',
    exampleVi:
      'Tôi là học sinh. Cô ấy thì hạnh phúc. Họ đang ở trong lớp học.\nTôi không mệt. Anh ấy không phải bác sĩ. Bạn sẵn sàng chưa?',
  },

  {
    id: 'A1-G02',
    level: 'A1',
    title: 'Hiện tại đơn – Simple Present (thói quen, sự thật)',
    summary: 'Dùng cho thói quen, lịch trình, sự thật hiển nhiên.',
    pattern:
      'Khẳng định: S + V(s/es) + O\nPhủ định: S + do/does not + V + O\nNghi vấn: Do/Does + S + V + O?',
    explanationVi:
      'Hiện tại đơn diễn tả thói quen (every day, usually, often…), lịch trình, sự thật hiển nhiên. Chủ ngữ “he/she/it” hoặc danh từ số ít thì động từ thêm “s/es” ở câu khẳng định. Ở câu phủ định và câu hỏi dùng “do/does” + động từ nguyên mẫu.',
    exampleEn:
      'I get up at 6 a.m. He goes to school by bus.\nThey do not (don’t) watch TV in the morning. Does she like coffee?',
    exampleVi:
      'Tôi thức dậy lúc 6 giờ sáng. Cậu ấy đi học bằng xe buýt.\nHọ không xem tivi vào buổi sáng. Cô ấy có thích cà phê không?',
  },

  {
    id: 'A1-G03',
    level: 'A1',
    title: 'Hiện tại tiếp diễn – Present Continuous',
    summary: 'Hành động đang xảy ra ngay lúc nói hoặc xung quanh hiện tại.',
    pattern: 'S + am / is / are + V-ing',
    explanationVi:
      'Dùng thì hiện tại tiếp diễn cho hành động đang diễn ra ngay bây giờ (now, at the moment) hoặc tạm thời. Động từ thêm “-ing”: work → working, study → studying. Thường đi với: now, right now, at the moment…',
    exampleEn:
      'She is studying English now.\nI am watching TV at the moment. They are playing football in the yard.',
    exampleVi:
      'Cô ấy đang học tiếng Anh ngay bây giờ.\nTôi đang xem tivi lúc này. Họ đang chơi bóng đá ngoài sân.',
  },

  {
    id: 'A1-G04',
    level: 'A1',
    title: 'Danh từ số ít – số nhiều & a / an',
    summary: 'Cách dùng a/an và thêm “s/es” để tạo số nhiều.',
    pattern:
      'Mạo từ: a / an + danh từ số ít\nSố nhiều: danh từ + s / es (cats, buses)',
    explanationVi:
      '“a/an” đứng trước danh từ số ít đếm được. “An” dùng trước âm nguyên âm (a, e, i, o, u). Danh từ số nhiều thường thêm “s/es”. Một số danh từ bất quy tắc: child → children, man → men…',
    exampleEn:
      'a book, an apple, a student, an orange.\nTwo books, three apples, four students.',
    exampleVi:
      'một quyển sách, một quả táo, một học sinh, một quả cam.\nHai quyển sách, ba quả táo, bốn học sinh.',
  },

  {
    id: 'A1-G05',
    level: 'A1',
    title: 'Mạo từ xác định – “the”',
    summary: 'Dùng “the” khi người nghe biết rõ mình đang nói về cái nào.',
    pattern: 'the + danh từ (số ít hoặc số nhiều)',
    explanationVi:
      '“The” dùng khi sự vật đã được nhắc đến trước đó hoặc cả người nói và người nghe đều biết rõ. Cũng dùng với danh từ chỉ vật duy nhất: the sun, the moon…',
    exampleEn:
      'I have a book. The book is on the table.\nThe sun is bright today.',
    exampleVi:
      'Tôi có một quyển sách. Quyển sách đó ở trên bàn.\nMặt trời hôm nay rất sáng.',
  },

  {
    id: 'A1-G06',
    level: 'A1',
    title: 'Tính từ sở hữu – my, your, his, her, our, their',
    summary: 'Nói “của ai đó” theo cách ngắn gọn.',
    pattern: 'Possessive adjective + noun (my book, her bag)',
    explanationVi:
      'Tính từ sở hữu đứng trước danh từ để chỉ “của ai”: my (của tôi), your (của bạn), his (của anh ấy), her (của cô ấy), our (của chúng tôi), their (của họ).',
    exampleEn:
      'This is my family. Her name is Anna. Their house is big.',
    exampleVi:
      'Đây là gia đình của tôi. Tên của cô ấy là Anna. Nhà của họ rất lớn.',
  },

  {
    id: 'A1-G07',
    level: 'A1',
    title: 'Sở hữu cách với “’s” – Tom’s book',
    summary: 'Nói “của + tên người” một cách ngắn gọn.',
    pattern: 'Noun (person) + ’s + noun (Tom’s book, Anna’s bag)',
    explanationVi:
      'Dùng “’s” sau tên người hoặc danh từ chỉ người để diễn tả sở hữu. Nếu là tên số nhiều có “s” thì chỉ thêm dấu ’ (the students’ room).',
    exampleEn:
      'This is Tom’s book. That is my brother’s car.',
    exampleVi:
      'Đây là quyển sách của Tom. Kia là chiếc xe của anh trai tôi.',
  },

  {
    id: 'A1-G08',
    level: 'A1',
    title: 'Đại từ tân ngữ – me, you, him, her, us, them',
    summary: 'Đứng sau động từ hoặc giới từ để chỉ “ai” nhận hành động.',
    pattern: 'S + V + object pronoun (me/you/him/her/us/them)',
    explanationVi:
      'Đại từ tân ngữ dùng sau động từ hoặc giới từ: me (tôi), you (bạn), him (anh ấy), her (cô ấy), us (chúng tôi), them (họ). Không đứng trước động từ chính.',
    exampleEn:
      'I love you. She helps him. Please give it to us.',
    exampleVi:
      'Tôi yêu bạn. Cô ấy giúp anh ấy. Làm ơn đưa nó cho chúng tôi.',
  },

  {
    id: 'A1-G09',
    level: 'A1',
    title: 'There is / There are',
    summary: 'Nói “có cái gì đó” ở một nơi nào đó.',
    pattern: 'There is + danh từ số ít\nThere are + danh từ số nhiều',
    explanationVi:
      '“There is” dùng với danh từ số ít hoặc không đếm được. “There are” dùng với danh từ số nhiều. Thường đi với giới từ chỉ nơi chốn: in, on, under, next to…',
    exampleEn:
      'There is a book on the table.\nThere are two chairs in the room.',
    exampleVi:
      'Có một quyển sách trên bàn.\nCó hai cái ghế trong phòng.',
  },

  {
    id: 'A1-G10',
    level: 'A1',
    title: 'Can / Can’t – diễn tả khả năng và phép',
    summary: 'Nói mình có thể hay không thể làm gì.',
    pattern: 'S + can / can’t + V-inf',
    explanationVi:
      '“Can” diễn tả khả năng (biết làm) hoặc được phép. “Can’t” (cannot) diễn tả không có khả năng hoặc không được phép. Sau “can/can’t” là động từ nguyên mẫu.',
    exampleEn:
      'I can swim but I can’t drive.\nCan you speak English?',
    exampleVi:
      'Tôi biết bơi nhưng tôi không biết lái xe.\nBạn có thể nói tiếng Anh không?',
  },

  {
    id: 'A1-G11',
    level: 'A1',
    title: 'Trạng từ chỉ tần suất – always, usually, often…',
    summary: 'Nói mức độ thường xuyên của hành động.',
    pattern: 'S + adverb of frequency + V (thường)\nbe + adverb of frequency',
    explanationVi:
      'Trạng từ chỉ tần suất: always (luôn luôn), usually (thường), often (thường xuyên), sometimes (thỉnh thoảng), never (không bao giờ). Đứng trước động từ thường, nhưng đứng sau “to be”: I always get up early. She is often late.',
    exampleEn:
      'I usually have breakfast at 7 a.m.\nHe is never late for school.',
    exampleVi:
      'Tôi thường ăn sáng lúc 7 giờ.\nCậu ấy không bao giờ đi học trễ.',
  },

  {
    id: 'A1-G12',
    level: 'A1',
    title: 'Like / love / hate + V-ing',
    summary: 'Nói mình thích hay ghét làm việc gì.',
    pattern: 'S + like / love / hate + V-ing',
    explanationVi:
      'Sau “like, love, hate” có thể dùng động từ dạng “V-ing” để nói về sở thích hoặc thói quen chung. Ở trình độ A1, dùng mẫu này để người học nói về những hoạt động mình thích/không thích.',
    exampleEn:
      'I like reading books. She loves playing badminton. They hate doing homework.',
    exampleVi:
      'Tôi thích đọc sách. Cô ấy thích chơi cầu lông. Họ ghét làm bài tập về nhà.',
  },

  {
    id: 'A1-G13',
    level: 'A1',
    title: 'Mệnh lệnh – Imperatives',
    summary: 'Dùng để cho lệnh, hướng dẫn, chỉ dẫn.',
    pattern: 'V-inf + O (không chủ ngữ)\nDon’t + V-inf + O (phủ định)',
    explanationVi:
      'Câu mệnh lệnh dùng động từ nguyên mẫu đứng đầu câu, không có chủ ngữ, dùng để hướng dẫn hoặc ra lệnh. Dạng phủ định dùng “Don’t + V”: Don’t run! Don’t be late!',
    exampleEn:
      'Open your book. Sit down, please.\nDon’t speak Vietnamese in class.',
    exampleVi:
      'Mở sách của bạn ra. Ngồi xuống, làm ơn.\nĐừng nói tiếng Việt trong lớp.',
  },

  {
    id: 'A1-G14',
    level: 'A1',
    title: 'This / That / These / Those',
    summary: 'Chỉ định vật gần / xa, số ít / số nhiều.',
    pattern:
      'This + danh từ số ít (gần)\nThat + danh từ số ít (xa)\nThese + danh từ số nhiều (gần)\nThose + danh từ số nhiều (xa)',
    explanationVi:
      '“This/These” dùng cho vật ở gần người nói; “That/Those” dùng cho vật ở xa. “This/That” với danh từ số ít, “These/Those” với danh từ số nhiều.',
    exampleEn:
      'This is my pen. That is your bag.\nThese are my friends. Those are his books.',
    exampleVi:
      'Đây là cây bút của tôi. Kia là chiếc cặp của bạn.\nĐây là những người bạn của tôi. Kia là những quyển sách của anh ấy.',
  },

  {
    id: 'A1-G15',
    level: 'A1',
    title: 'Giới từ chỉ nơi chốn – in, on, under, next to…',
    summary: 'Nói vị trí của đồ vật trong không gian.',
    pattern:
      'S + be + prep of place + N\n(in / on / under / next to / behind / in front of / between)',
    explanationVi:
      'Các giới từ phổ biến: in (trong), on (trên bề mặt), under (bên dưới), next to (bên cạnh), behind (đằng sau), in front of (ở phía trước), between (ở giữa hai vật).',
    exampleEn:
      'The cat is under the table. The book is on the desk.\nThe school is next to the park.',
    exampleVi:
      'Con mèo ở dưới cái bàn. Quyển sách ở trên bàn học.\nTrường học nằm cạnh công viên.',
  },

  {
    id: 'A1-G16',
    level: 'A1',
    title: 'Giới từ chỉ thời gian – in, on, at',
    summary: 'Nói thời gian một cách ngắn gọn, tự nhiên.',
    pattern:
      'at + giờ (at 7 o’clock)\non + ngày, thứ (on Monday, on May 5th)\nin + tháng, năm, mùa (in July, in 2025, in summer)',
    explanationVi:
      '“at” dùng cho giờ cụ thể; “on” dùng cho ngày, thứ; “in” dùng cho tháng, năm, mùa, buổi (in the morning). Đây là mẫu rất hay dùng trong A1 khi mô tả lịch trình hằng ngày.',
    exampleEn:
      'I get up at 6 a.m. We have English on Monday.\nWe go on holiday in July.',
    exampleVi:
      'Tôi thức dậy lúc 6 giờ sáng. Chúng tôi học tiếng Anh vào thứ Hai.\nChúng tôi đi nghỉ vào tháng Bảy.',
  },

  {
    id: 'A1-G17',
    level: 'A1',
    title: 'Some / any – lượng từ cơ bản',
    summary: 'Nói “một vài / một ít” trong câu khẳng định, phủ định, nghi vấn.',
    pattern:
      'Khẳng định: some + N (đếm được số nhiều / không đếm được)\nPhủ định, nghi vấn: any + N',
    explanationVi:
      '“Some” thường dùng trong câu khẳng định. “Any” thường dùng trong câu phủ định và câu hỏi. Cả hai đều có thể đi với danh từ đếm được số nhiều hoặc không đếm được.',
    exampleEn:
      'We have some milk in the fridge. I don’t have any brothers.\nDo you have any questions?',
    exampleVi:
      'Chúng tôi có một ít sữa trong tủ lạnh. Tôi không có anh/em trai nào.\nBạn có câu hỏi nào không?',
  },

  {
    id: 'A1-G18',
    level: 'A1',
    title: 'Câu hỏi với Wh- questions – What, Where, When, Who, How old',
    summary: 'Hỏi thông tin chi tiết: cái gì, ở đâu, khi nào, ai, bao nhiêu tuổi.',
    pattern:
      'Wh-word + do/does + S + V + O?\nWh-word + be + S?',
    explanationVi:
      'Các từ hỏi cơ bản: What (cái gì), Where (ở đâu), When (khi nào), Who (ai), How old (bao nhiêu tuổi). Thường đi cùng do/does hoặc to be tùy cấu trúc câu.',
    exampleEn:
      'What do you do? Where do you live?\nWhen is your birthday? Who is your teacher? How old are you?',
    exampleVi:
      'Bạn làm nghề gì? Bạn sống ở đâu?\nSinh nhật bạn khi nào? Ai là giáo viên của bạn? Bạn bao nhiêu tuổi?',
  },
];

export function getGrammarByLevel(level: string) {
  // Sau này có A2/B1 thì switch theo level; hiện tại: mọi level đều map về A1 demo
  const cefrLevel = 'A1' as const;

  return {
    cefrLevel,
    items: GRAMMAR_A1 as GrammarPoint[],
  };
}
