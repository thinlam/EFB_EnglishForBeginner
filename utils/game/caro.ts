import { WIN_LEN } from '@/constants/game/caro';
import type { Board, Cell } from '@/types/game/caro';

export const makeEmptyBoard = (n: number): Board =>
  Array.from({ length: n }, () => Array.from({ length: n }, () => null));

const dirs: Cell[] = [{ r:0,c:1 },{ r:1,c:0 },{ r:1,c:1 },{ r:1,c:-1 }];

export function checkWinner(board: Board, who: 'X'|'O', len = WIN_LEN): boolean {
  const N = board.length;
  for (let r=0;r<N;r++) for (let c=0;c<N;c++) {
    if (board[r][c] !== who) continue;
    for (const d of dirs) {
      let k=1;
      while (r+d.r*k>=0 && r+d.r*k<N && c+d.c*k>=0 && c+d.c*k<N && board[r+d.r*k][c+d.c*k]===who) k++;// count
      if (k>=len) return true;
    }
  }
  return false;
}

export function randomEmptyCellNear(board: Board): Cell | null {
  const N = board.length, near: Cell[] = [], all: Cell[] = [];
  for (let r=0;r<N;r++) for (let c=0;c<N;c++) {
    if (board[r][c]) continue;
    all.push({ r, c });
    let ok = false;
    for (let dr=-1;dr<=1 && !ok;dr++) for (let dc=-1;dc<=1 && !ok;dc++) {
      const rr=r+dr, cc=c+dc;
      if (rr>=0&&rr<N&&cc>=0&&cc<N && board[rr][cc]) ok = true;
    }
    if (ok) near.push({ r, c });
  }
  const pool = near.length ? near : all;
  if (!pool.length) return null;
  return pool[Math.floor(Math.random()*pool.length)];
}
