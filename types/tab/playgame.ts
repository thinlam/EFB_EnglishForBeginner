export type GameItem = {
  id: string;
  title: string;
  icon: string;
  gradient: readonly [string, string];
  subtitle: string;
  levels?: string[];
  route: string; // <- thêm
};
