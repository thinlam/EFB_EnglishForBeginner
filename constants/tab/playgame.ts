import type { GameItem } from '@/types/tab/playgame';

export const GAME_ITEMS: GameItem[] = [
  
  {
    id: 'caro',
    title: 'Game caro',
    subtitle: 'Đánh caro + ôn từ vựng',
    icon: 'grid',
    route: '/game',            // <-- bấm là mở Level Map
    gradient: ['#0ea5e9', '#2563eb'],
    levels: ['Lv1', 'Lv2', 'Lv3','Lv4', '...'], // <- vào bản đồ level
  },
  {
    id: 'vocab-sprint',
    title: 'Vocab Sprint',
    icon: 'flash',
    gradient: ['#34D399', '#059669'],
    subtitle: 'Tốc độ • Từ vựng',
    levels: ['Beginner', 'Intermediate'],
    route: '/game/vocab',
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
