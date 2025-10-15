import type { GameItem } from '@/types/tab/playgame';

export const GAME_ITEMS: GameItem[] = [
   {
    id: 'game-hub',
    title: 'Game',
    icon: 'game-controller',
    gradient: ['#FBBF24', '#D97706'],
    subtitle: 'Game Hub (tất cả mini games)',
    levels: ['Tool'],
    route: '/game', // <- mở Game Hub (list mini games)
  },
  {
    id: 'caro',
    title: 'Caro',
    icon: 'grid',
    gradient: ['#fb923c', '#ef4444'],
    subtitle: '5-in-a-row + AV Quiz',
    levels: ['Level Map'],
    route: '/game/Caro/levels', // <- vào bản đồ level
  },
  {
    id: 'vocab-sprint',
    title: 'Vocab Sprint',
    icon: 'flash',
    gradient: ['#34D399', '#059669'],
    subtitle: 'Tốc độ • Từ vựng',
    levels: ['Beginner', 'Intermediate'],
    route: '/game/vocab-sprint',
  },
  {
    id: 'listen-tap',
    title: 'Listen & Tap',
    icon: 'ear',
    gradient: ['#60A5FA', '#2563EB'],
    subtitle: 'Nghe – bắt chữ',
    levels: ['Beginner'],
    route: '/game/listen-tap',
  },
  {
    id: 'word-puzzle',
    title: 'Word Puzzle',
    icon: 'extension-puzzle',
    gradient: ['#F472B6', '#DB2777'],
    subtitle: 'Ghép chữ',
    levels: ['Intermediate', 'Advanced'],
    route: '/game/word-puzzle',
  },
  
  
];
