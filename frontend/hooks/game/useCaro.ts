import { BOARD_SIZE, BOT, HUMAN, Player, WIN_LEN } from '@/constants/game/caro';
import type { Board, Cell, EndStats } from '@/types/game/caro';
import { checkWinner, makeEmptyBoard, randomEmptyCellNear } from '@/utils/game/caro';
import { calcStarsAndExp } from '@/utils/game/scoring';
import React from 'react';

export function useCaro({ level }: { level: number }) {
  const [board, setBoard] = React.useState<Board>(() => makeEmptyBoard(BOARD_SIZE));
  const [turn, setTurn] = React.useState<Player>(BOT); // bot đi trước
  const [winner, setWinner] = React.useState<Player | null>(null);
  const [lastPick, setLastPick] = React.useState<Cell | null>(null);

  const stats = React.useRef<EndStats>({ total: 0, correct: 0, wrong: 0, maxStreak: 0, streak: 0 });
  const [stars, setStars] = React.useState<0|1|2|3>(0);
  const [exp, setExp] = React.useState<number>(0);

  const place = React.useCallback((cell: Cell, who: Player) => {
    setBoard(prev => {
      if (prev[cell.r][cell.c]) return prev;
      const next = prev.map(r => r.slice());
      next[cell.r][cell.c] = who;
      return next;
    });
    setLastPick(cell);
  }, []);

  const botFirstMoveIfNeeded = React.useCallback(() => {
    if (turn === BOT && !winner) {
      const center = Math.floor(BOARD_SIZE / 2);
      place({ r: center, c: center }, BOT);
      setTurn(HUMAN);
    }
  }, [turn, winner, place]);

  const endCheck = React.useCallback((who: Player, next: Board) => {
    if (checkWinner(next, who, WIN_LEN)) {
      setWinner(who);
      const { stars, exp } = calcStarsAndExp(stats.current);
      setStars(stars); setExp(exp);
      return true;
    }
    return false;
  }, []);

  const handleHumanTap = React.useCallback((cell: Cell, isCorrect: boolean) => {
    if (winner) return;
    stats.current.total += 1;

    if (isCorrect) {
      stats.current.correct += 1;
      stats.current.streak += 1;
      stats.current.maxStreak = Math.max(stats.current.maxStreak, stats.current.streak);

      setBoard(prev => {
        if (prev[cell.r][cell.c]) return prev;
        const next = prev.map(r => r.slice());
        next[cell.r][cell.c] = HUMAN;
        if (checkWinner(next, HUMAN, WIN_LEN)) {
          setWinner(HUMAN);
          const { stars, exp } = calcStarsAndExp(stats.current);
          setStars(stars); setExp(exp);
          return next;
        }
        return next;
      });

      setLastPick(cell);
      setTurn(BOT);

      setTimeout(() => {
        setBoard(prev => {
          const botCell = randomEmptyCellNear(prev);
          if (!botCell) return prev;
          const next = prev.map(r => r.slice());
          next[botCell.r][botCell.c] = BOT;
          if (checkWinner(next, BOT, WIN_LEN)) {
            setWinner(BOT);
            const { stars, exp } = calcStarsAndExp(stats.current);
            setStars(stars); setExp(exp);
            return next;
          }
          setLastPick(botCell);
          setTurn(HUMAN);
          return next;
        });
      }, 300);

    } else {
      stats.current.wrong += 1;
      stats.current.streak = 0;

      setBoard(prev => {
        const xCell = randomEmptyCellNear(prev);
        if (!xCell) return prev;
        const mid = prev.map(r => r.slice());
        mid[xCell.r][xCell.c] = HUMAN;
        if (endCheck(HUMAN, mid)) return mid;
        return mid;
      });

      setTimeout(() => {
        setBoard(prev => {
          const oCell = randomEmptyCellNear(prev);
          if (!oCell) return prev;
          const next = prev.map(r => r.slice());
          next[oCell.r][oCell.c] = BOT;
          if (endCheck(BOT, next)) return next;
          setLastPick(oCell);
          setTurn(HUMAN);
          return next;
        });
      }, 300);
    }
  }, [winner, endCheck]);

  const resetGame = React.useCallback(() => {
    setBoard(makeEmptyBoard(BOARD_SIZE));
    setTurn(BOT); setWinner(null); setLastPick(null);
    stats.current = { total: 0, correct: 0, wrong: 0, maxStreak: 0, streak: 0 };
    setStars(0); setExp(0);
    setTimeout(botFirstMoveIfNeeded, 150);
  }, [botFirstMoveIfNeeded]);

  return { board, turn, winner, stars, exp, stats: stats.current, lastPick, handleHumanTap, resetGame, botFirstMoveIfNeeded };
}
