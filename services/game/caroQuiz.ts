import type { QuizQuestion } from '@/types/game/caro';

const BANK: QuizQuestion[] = [
  { id: 'q1', prompt: 'Choose the correct past of “go”.', choices: [
    { id: 'a', text: 'goed', correct: false }, { id: 'b', text: 'went', correct: true },
    { id: 'c', text: 'goes', correct: false }, { id: 'd', text: 'going', correct: false },
  ]},
  { id: 'q2', prompt: 'Synonym of “rapid”.', choices: [
    { id: 'a', text: 'slow', correct: false }, { id: 'b', text: 'quick', correct: true },
    { id: 'c', text: 'noisy', correct: false }, { id: 'd', text: 'cheap', correct: false },
  ]},
  { id: 'q3', prompt: 'Meaning of “achievement”.', choices: [
    { id: 'a', text: 'A thing done successfully', correct: true },
    { id: 'b', text: 'A kind of failure', correct: false },
    { id: 'c', text: 'A random guess', correct: false },
    { id: 'd', text: 'A long distance', correct: false },
  ]},
];

export async function getRandomQuestion(): Promise<QuizQuestion> {
  await new Promise(r => setTimeout(r, 150));
  return BANK[Math.floor(Math.random() * BANK.length)];
}
