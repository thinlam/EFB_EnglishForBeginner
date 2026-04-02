// hooks/game/useQuiz.ts
import type { Difficulty } from '@/game/caro/difficulty';
import { getRandomQuestion } from '@/services/game/caroQuiz'; // bản có hỗ trợ getRandomQuestion(difficulty)
import type { Cell } from '@/types/game/caro';
import { useCallback, useEffect, useRef, useState } from 'react';

type UseQuizOpts = {
  onCorrect: (cell: Cell) => void;
  onTimeoutOrWrong: (cell: Cell) => void;

  /** NEW: truyền độ khó từ màn chơi (easy/medium/hard/boss) */
  difficulty?: Difficulty;

  /** NEW: thời gian đếm ngược (giây) — rút ngắn khi khó/boss */
  timeLimitSeconds?: number;
};

export function useQuiz({
  onCorrect,
  onTimeoutOrWrong,
  difficulty = 'easy',
  timeLimitSeconds = 15,
}: UseQuizOpts) {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState<any | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(timeLimitSeconds);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingCellRef = useRef<Cell | null>(null);

  // HẾT GIỜ
  const clearTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  // NEW: mỗi khi difficulty/timeLimitSeconds thay đổi => reset countdown mặc định
  useEffect(() => {
    if (!visible) setSecondsLeft(timeLimitSeconds);
  }, [timeLimitSeconds, difficulty, visible]);

  // MỞ CÂU HỎI CHO Ô
  const showQuestionForCell = useCallback(async (cell: Cell) => {
    setLoading(true);
    setVisible(true);
    pendingCellRef.current = cell;

    // 🔥 QUAN TRỌNG: truyền đúng độ khó xuống bank
    const q = await getRandomQuestion(difficulty);
    setQuestion(q);
    setLoading(false);

    // Bật timer
    setSecondsLeft(timeLimitSeconds);
    clearTimer();
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearTimer();
          // Hết giờ => coi như sai
          const c = pendingCellRef.current!;
          pendingCellRef.current = null;
          setVisible(false);
          onTimeoutOrWrong(c);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, [difficulty, timeLimitSeconds, onTimeoutOrWrong, clearTimer]);

  // TRẢ LỜI
  const submitAnswer = useCallback((isCorrect: boolean) => {
    clearTimer();
    const c = pendingCellRef.current!;
    pendingCellRef.current = null;
    setVisible(false);
    if (isCorrect) onCorrect(c);
    else onTimeoutOrWrong(c);
  }, [onCorrect, onTimeoutOrWrong, clearTimer]);

  // ĐÓNG MODAL
  const dismissQuestion = useCallback(() => {
    clearTimer();
    pendingCellRef.current = null;
    setVisible(false);
  }, [clearTimer]);

  return {
    visible,
    loading,
    question,
    secondsLeft,
    showQuestionForCell,
    submitAnswer,
    dismissQuestion,
  };
}
