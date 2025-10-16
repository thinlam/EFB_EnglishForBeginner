export const BOARD_SIZE = 13;
export const WIN_LEN = 5;
export const QUIZ_TIME_SEC = 20 as const; // thời gian trả lời câu hỏi (giây)

export type Player = 'X' | 'O';
export const HUMAN: Player = 'X'; // người chơi là X
export const BOT: Player = 'O'; // bot là O (đi trước)
