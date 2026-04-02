export type Cell = { r: number; c: number };
export type Board = (('X' | 'O' | null)[])[];

export type QuizChoice = { id: string; text: string; correct: boolean };
export type QuizQuestion = { id: string; prompt: string; choices: QuizChoice[] };

export type EndStats = {
  total: number;
  correct: number;
  wrong: number;
  maxStreak: number;
  streak: number;
};
