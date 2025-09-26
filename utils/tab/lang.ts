import type { Lang } from '@/hooks/tab/useTranslate';

export const langFull = (l: Lang) => (l === 'en' ? 'English' : 'Vietnamese');
export const flagOf = (l: Lang) =>
  l === 'en'
    ? require('@/assets/images/CO-MI.png')
    : require('@/assets/images/CO-VIETNAM.png');
