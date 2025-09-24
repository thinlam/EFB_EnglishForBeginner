export type StartKey = 'basic' | 'test';

export const START_OPTIONS: {
  key: StartKey;
  title: string;
  desc: string;
  icon: any; // require(...)
}[] = [
  {
    key: 'basic',
    title: 'Bắt đầu từ cơ bản',
    desc: 'Học những chủ đề nền tảng trong khóa học Tiếng Anh',
    icon: require('@/assets/images/book.png'),
  },
  { 
    key: 'test',
    title: 'Xác định trình độ hiện tại',
    desc: 'Làm bài test 4 kỹ năng để xác định lộ trình phù hợp nhất',
    icon: require('@/assets/images/compass.png'),
  },
];
