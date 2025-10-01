export type GameItem = {
  id: string;
  title: string;
  icon:
    | 'game-controller'
    | 'flash'
    | 'ear'
    | 'extension-puzzle'
    | string; // mở để bạn thêm icon khác
  gradient: readonly [string, string];
  subtitle?: string;
  levels?: string[];
};
