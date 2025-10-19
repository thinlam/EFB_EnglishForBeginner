import type { QuizQuestion } from '@/types/game/caro';

/** Mở rộng type thêm thuộc tính độ khó */
export type Difficulty = 'easy' | 'medium' | 'hard' | 'boss';

export interface QuizQuestionPro extends QuizQuestion {
  difficulty: Difficulty;
}

/** Ngân hàng câu hỏi có độ khó */
const BANK: QuizQuestionPro[] = [
  // ===== EASY =====
  { id: 'q1', difficulty: 'easy', prompt: 'Choose the correct past of “go”.', choices: [
    { id: 'a', text: 'goed', correct: false },
    { id: 'b', text: 'went', correct: true },
    { id: 'c', text: 'goes', correct: false },
    { id: 'd', text: 'going', correct: false },
  ]},
  { id: 'q2', difficulty: 'easy', prompt: 'Synonym of “rapid”.', choices: [
    { id: 'a', text: 'slow', correct: false },
    { id: 'b', text: 'quick', correct: true },
    { id: 'c', text: 'noisy', correct: false },
    { id: 'd', text: 'cheap', correct: false },
  ]},
  { id: 'q3', difficulty: 'easy', prompt: 'Meaning of “achievement”.', choices: [
    { id: 'a', text: 'A thing done successfully', correct: true },
    { id: 'b', text: 'A kind of failure', correct: false },
    { id: 'c', text: 'A random guess', correct: false },
    { id: 'd', text: 'A long distance', correct: false },
  ]},
  { id: 'q4', difficulty: 'easy', prompt: 'Opposite of “happy”.', choices: [
    { id: 'a', text: 'sad', correct: true },
    { id: 'b', text: 'funny', correct: false },
    { id: 'c', text: 'kind', correct: false },
    { id: 'd', text: 'fast', correct: false },
  ]},
  { id: 'q5', difficulty: 'easy', prompt: '“Cat” is a kind of ____.', choices: [
    { id: 'a', text: 'animal', correct: true },
    { id: 'b', text: 'plant', correct: false },
    { id: 'c', text: 'machine', correct: false },
    { id: 'd', text: 'color', correct: false },
  ]},

  // ===== MEDIUM =====
  { id: 'q6', difficulty: 'medium', prompt: 'Past form of “teach”.', choices: [
    { id: 'a', text: 'teached', correct: false },
    { id: 'b', text: 'taught', correct: true },
    { id: 'c', text: 'teach', correct: false },
    { id: 'd', text: 'teaching', correct: false },
  ]},
  { id: 'q7', difficulty: 'medium', prompt: 'Choose the correct sentence.', choices: [
    { id: 'a', text: 'She go to school every day.', correct: false },
    { id: 'b', text: 'She goes to school every day.', correct: true },
    { id: 'c', text: 'She going to school every day.', correct: false },
    { id: 'd', text: 'She gone to school every day.', correct: false },
  ]},
  { id: 'q8', difficulty: 'medium', prompt: 'Synonym of “enormous”.', choices: [
    { id: 'a', text: 'tiny', correct: false },
    { id: 'b', text: 'huge', correct: true },
    { id: 'c', text: 'sad', correct: false },
    { id: 'd', text: 'funny', correct: false },
  ]},
  { id: 'q9', difficulty: 'medium', prompt: '“They have been friends ___ childhood.”', choices: [
    { id: 'a', text: 'since', correct: true },
    { id: 'b', text: 'for', correct: false },
    { id: 'c', text: 'by', correct: false },
    { id: 'd', text: 'at', correct: false },
  ]},
  { id: 'q10', difficulty: 'medium', prompt: 'Opposite of “success”.', choices: [
    { id: 'a', text: 'failure', correct: true },
    { id: 'b', text: 'victory', correct: false },
    { id: 'c', text: 'goal', correct: false },
    { id: 'd', text: 'effort', correct: false },
  ]},

  // ===== HARD =====
  { id: 'q11', difficulty: 'hard', prompt: 'Meaning of “meticulous”.', choices: [
    { id: 'a', text: 'Careful and precise', correct: true },
    { id: 'b', text: 'Lazy and slow', correct: false },
    { id: 'c', text: 'Fast and careless', correct: false },
    { id: 'd', text: 'Simple and easy', correct: false },
  ]},
  { id: 'q12', difficulty: 'hard', prompt: 'Choose the correct reported speech: “I am tired,” she said.', choices: [
    { id: 'a', text: 'She said she is tired.', correct: false },
    { id: 'b', text: 'She said she was tired.', correct: true },
    { id: 'c', text: 'She said she were tired.', correct: false },
    { id: 'd', text: 'She said she be tired.', correct: false },
  ]},
  { id: 'q13', difficulty: 'hard', prompt: 'Opposite of “generous”.', choices: [
    { id: 'a', text: 'stingy', correct: true },
    { id: 'b', text: 'friendly', correct: false },
    { id: 'c', text: 'polite', correct: false },
    { id: 'd', text: 'grateful', correct: false },
  ]},
  { id: 'q14', difficulty: 'hard', prompt: 'Complete: “He managed to finish the work ____ the difficulty.”', choices: [
    { id: 'a', text: 'in spite of', correct: true },
    { id: 'b', text: 'because', correct: false },
    { id: 'c', text: 'so', correct: false },
    { id: 'd', text: 'although', correct: false },
  ]},
  { id: 'q15', difficulty: 'hard', prompt: '“Scarce” is closest in meaning to ____.', choices: [
    { id: 'a', text: 'rare', correct: true },
    { id: 'b', text: 'common', correct: false },
    { id: 'c', text: 'plenty', correct: false },
    { id: 'd', text: 'enough', correct: false },
  ]},

  // ===== BOSS =====
  { id: 'q16', difficulty: 'boss', prompt: 'Meaning of “altruism”.', choices: [
    { id: 'a', text: 'Selfish behavior', correct: false },
    { id: 'b', text: 'Disinterest in others', correct: false },
    { id: 'c', text: 'Unselfish concern for others', correct: true },
    { id: 'd', text: 'Desire for wealth', correct: false },
  ]},
  { id: 'q17', difficulty: 'boss', prompt: 'Choose the sentence with correct conditional form.', choices: [
    { id: 'a', text: 'If I will see him, I tell him.', correct: false },
    { id: 'b', text: 'If I see him, I will tell him.', correct: true },
    { id: 'c', text: 'If I saw him, I tell him.', correct: false },
    { id: 'd', text: 'If I seen him, I will tell him.', correct: false },
  ]},
  { id: 'q18', difficulty: 'boss', prompt: '“Ubiquitous” means ____.', choices: [
    { id: 'a', text: 'Present everywhere', correct: true },
    { id: 'b', text: 'Hidden underground', correct: false },
    { id: 'c', text: 'Dangerous or risky', correct: false },
    { id: 'd', text: 'Unnecessary', correct: false },
  ]},
  { id: 'q19', difficulty: 'boss', prompt: 'Opposite of “abundant”.', choices: [
    { id: 'a', text: 'scarce', correct: true },
    { id: 'b', text: 'plentiful', correct: false },
    { id: 'c', text: 'overflowing', correct: false },
    { id: 'd', text: 'ample', correct: false },
  ]},
  { id: 'q20', difficulty: 'boss', prompt: '“Tenacious” is closest in meaning to ____.', choices: [
    { id: 'a', text: 'Determined and persistent', correct: true },
    { id: 'b', text: 'Weak and unsure', correct: false },
    { id: 'c', text: 'Careless', correct: false },
    { id: 'd', text: 'Slow and lazy', correct: false },
  ]},
];

/** Random theo độ khó */
export async function getRandomQuestion(difficulty: Difficulty = 'easy'): Promise<QuizQuestionPro> {
  await new Promise(r => setTimeout(r, 150));

  const pool = BANK.filter(q => q.difficulty === difficulty);
  const list = pool.length > 0 ? pool : BANK; // fallback toàn bộ nếu không có
  return list[Math.floor(Math.random() * list.length)];
}
