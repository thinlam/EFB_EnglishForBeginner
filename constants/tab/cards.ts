import { ColorValue } from 'react-native';

export type GradientColors =
  | readonly [ColorValue, ColorValue]
  | readonly [ColorValue, ColorValue, ColorValue];

export type Item = {
  id: string;
  title: string;
  icon: any;
  gradient: GradientColors;
  topics?: number;
  subtitle?: string;
  levels?: string[];
};

export const DATA: Item[] = [
  { id: '1', title: 'Listening', icon: 'headset',
    gradient: ['#5EEAD4', '#3B82F6'] as const, topics: 20, levels: ['A1','A2','B1','B2','C1','C2'] },
  { id: '2', title: 'Speaking', icon: 'mic',
    gradient: ['#D946EF', '#7C3AED'] as const, topics: 18, levels: ['A1','A2','B1','B2','C1','C2'] },
  { id: '3', title: 'Reading', icon: 'book',
    gradient: ['#FB7185', '#DC2626'] as const, topics: 15, levels: ['A1','A2','B1','B2','C1','C2'] },
  { id: '4', title: 'Writing', icon: 'pencil',
    gradient: ['#FDE047', '#F59E0B'] as const, topics: 12, levels: ['A1','A2','B1','B2','C1','C2'] },
  { id: '5', title: 'Test', icon: 'document-text-outline',
    gradient: ['#2DD4BF', '#0EA5E9'] as const, subtitle: 'Bài tập tổng hợp', levels: ['All'] },
  { id: '6', title: 'Translate', icon: 'globe',
    gradient: ['#34D399', '#14B8A6'] as const, subtitle: 'Dịch văn bản', levels: ['Tool'] },
  { id: '7', title: 'Bảng xếp hạng', icon: 'trophy',
    gradient: ['#FB923C', '#B91C1C'] as const, subtitle: 'Xếp hạng', levels: ['Ranking'] },
  { id: '8', title: 'Play & learn', icon: 'game-controller',
    gradient: ['#FBBF24', '#D97706'] as const, subtitle: 'Game', levels: ['Tool'] },
];
