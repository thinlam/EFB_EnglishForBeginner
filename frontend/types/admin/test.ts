export type TestQuestionBase = {
  type: 'vocabulary' | 'grammar' | 'reading' | string;
  question: string;
  options: string[];
  correctAnswer: string;
  createdAt?: any;
  // optional: explanation?, level?, topic?
};

export type TestQuestion = TestQuestionBase & {
  id: string;
};
