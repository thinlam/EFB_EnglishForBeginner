import { QUIZ_TIME_SEC } from '@/constants/game/caro';
import { getRandomQuestion } from '@/services/game/caroQuiz';
import type { Cell, QuizQuestion } from '@/types/game/caro';
import React from 'react';

export function useQuiz(opts: { onCorrect: (c: Cell)=>void; onTimeoutOrWrong: (c: Cell)=>void; }) {
  const [visible, setVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [question, setQuestion] = React.useState<QuizQuestion | null>(null);
  const [secondsLeft, setSecondsLeft] = React.useState<number>(QUIZ_TIME_SEC);
  const pendingCell = React.useRef<Cell | null>(null);

  React.useEffect(() => {
    if (!visible) return;
    setSecondsLeft(QUIZ_TIME_SEC);
    const t = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(t);
          const cell = pendingCell.current!;
          setVisible(false);
          opts.onTimeoutOrWrong(cell);
          return QUIZ_TIME_SEC;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [visible]);

  const showQuestionForCell = async (cell: Cell) => {
    pendingCell.current = cell; setLoading(true); setVisible(true);
    const q = await getRandomQuestion(); setQuestion(q); setLoading(false);
  };
  const submitAnswer = (correct: boolean) => {
    const cell = pendingCell.current!;
    setVisible(false);
    correct ? opts.onCorrect(cell) : opts.onTimeoutOrWrong(cell);
  };
  const dismissQuestion = () => setVisible(false);

  return { visible, loading, question, secondsLeft, showQuestionForCell, submitAnswer, dismissQuestion };
}
