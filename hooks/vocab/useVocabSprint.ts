import { SPRINT, STREAK_BONUS } from '@/constants/vocab-sprint';
import { getRandomQuestion } from '@/services/vocab/sprint-source';
import type { VocabQuestion } from '@/types/vocab';
import { pickOtherMeaning, randBool } from '@/utils/vocab';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Phase = 'ready' | 'playing' | 'ended';

type State = {
  phase: Phase;
  timeLeft: number;
  hearts: number;
  score: number;
  streak: number;
  bestStreak: number;
  correct: number;
  wrong: number;
};

export function useVocabSprint() {
  const [state, setState] = useState<State>({
    phase: 'ready',
    timeLeft: SPRINT.DURATION_SEC,
    hearts: SPRINT.HEARTS,
    score: 0,
    streak: 0,
    bestStreak: 0,
    correct: 0,
    wrong: 0,
  });

  const [question, setQuestion] = useState<VocabQuestion | null>(null);
  const [shownMeaning, setShownMeaning] = useState<string>('');
  const [isMatchShown, setIsMatchShown] = useState<boolean>(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    setState(prev => {
      const next = { ...prev, timeLeft: prev.timeLeft - 1 };
      if (next.timeLeft <= 0) return { ...next, phase: 'ended' };
      return next;
    });
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = setInterval(tick, 1000);
  }, [stopTimer, tick]);

  const prepareQuestion = useCallback(async () => {
    const q = await getRandomQuestion();
    const showMatch = randBool(SPRINT.MATCH_RATE);
    const meaning = showMatch ? q.meaning : pickOtherMeaning(q.id);
    setQuestion(q);
    setIsMatchShown(showMatch);
    setShownMeaning(meaning);
  }, []);

  const onStart = useCallback(() => {
    setState(s => ({ ...s, phase: 'playing', timeLeft: SPRINT.DURATION_SEC, score: 0, streak: 0, bestStreak: 0, correct: 0, wrong: 0, hearts: SPRINT.HEARTS }));
    prepareQuestion();
    startTimer();
  }, [prepareQuestion, startTimer]);

  const endGame = useCallback(() => {
    stopTimer();
    setState(s => ({ ...s, phase: 'ended' }));
  }, [stopTimer]);

  const onAnswer = useCallback((userThinksMatch: boolean) => {
    setState(s => {
      if (s.phase !== 'playing') return s;

      const correct = userThinksMatch === isMatchShown;
      const next = { ...s };
      if (correct) {
        next.correct += 1;
        next.streak += 1;
        next.bestStreak = Math.max(next.bestStreak, next.streak);
        const bonus = STREAK_BONUS[next.streak] ?? STREAK_BONUS.DEFAULT;
        next.score += SPRINT.POINT_PER_CORRECT + bonus;
      } else {
        next.wrong += 1;
        next.streak = 0;
        next.hearts -= 1;
      }
      return next;
    });

    // load câu hỏi tiếp theo hoặc kết thúc
    setTimeout(() => {
      setState(s => {
        if (s.hearts <= 0) { stopTimer(); return { ...s, phase: 'ended' }; }
        return s;
      });
      if (state.phase === 'playing') prepareQuestion();
    }, 160);
  }, [isMatchShown, prepareQuestion, state.phase, stopTimer]);

  const onRestart = useCallback(() => {
    onStart();
  }, [onStart]);

  useEffect(() => () => stopTimer(), [stopTimer]);

  const expose = useMemo(() => ({
    state, question, shownMeaning, isMatchShown, onAnswer, onStart, onRestart,
  }), [state, question, shownMeaning, isMatchShown, onAnswer, onStart, onRestart]);

  return expose;
}
