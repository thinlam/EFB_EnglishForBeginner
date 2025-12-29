import type { GameItem } from '@/types/tab/playgame';

export const GAME_ITEMS: GameItem[] = [
  
  {
    id: 'caro',
    title: 'Game caro',
    subtitle: 'Đánh caro + ôn từ vựng',
    icon: 'grid',
    route: '/game/caro/levels',            // <-- bấm là mở Level Map
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
  // ================== COMING SOON ==================

  {
    id: 'word-match',
    title: 'Word Match',
    icon: 'albums',
    gradient: ['#FBBF24', '#F97316'],
    subtitle: 'Ghép đôi từ vựng',
    route: '/game/word-match',
    comingSoon: true,
  },
  {
    id: 'quiz-challenge',
    title: 'Quiz Challenge',
    icon: 'help-circle',
    gradient: ['#A78BFA', '#8B5CF6'],
    subtitle: 'Câu hỏi trắc nghiệm',
    route: '/game/quiz',
    comingSoon: true,
  },
  {
    id: 'memory-cards',
    title: 'Memory Cards',
    icon: 'cards',
    gradient: ['#F87171', '#EF4444'],
    subtitle: 'Thẻ nhớ từ vựng',
    route: '/game/memory-cards',
    comingSoon: true,
  },
  {
    id: 'sentence-builder',
    title: 'Sentence Builder',
    icon: 'construct',
    gradient: ['#34D399', '#10B981'],
    subtitle: 'Xây dựng câu',
    route: '/game/sentence-builder',
    comingSoon: true,
  },
  {
    id: 'listening-challenge',
    title: 'Listening Challenge',
    icon: 'headphones',
    gradient: ['#60A5FA', '#3B82F6'],
    subtitle: 'Thử thách nghe hiểu',
    route: '/game/listening-challenge',
    comingSoon: true,
  },
  {
    id: 'spelling-bee',
    title: 'Spelling Bee',
    icon: 'text',
    gradient: ['#FBBF24', '#F59E0B'],
    subtitle: 'Chính tả từ vựng',
    route: '/game/spelling-bee',
    comingSoon: true,
  },
  {
    id: 'word-search',
    title: 'Word Search',
    icon: 'search',
    gradient: ['#F472B6', '#EC4899'],
    subtitle: 'Tìm từ vựng',
    route: '/game/word-search',
    comingSoon: true,
  },
  {
    id: 'grammar-quiz',
    title: 'Grammar Quiz',
    icon: 'book',
    gradient: ['#A78BFA', '#C4B5FD'],
    subtitle: 'Trắc nghiệm ngữ pháp',
    route: '/game/grammar-quiz',
    comingSoon: true,
  },
];
