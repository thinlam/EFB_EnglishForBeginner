// /types/Ranking.ts
export interface RankingUser {
  uid: string;
  displayName: string;
  photoURL?: string;
  cefrXp: number;          // tổng XP (nguồn chính)
  testCompleted: number;  // số bài test hoàn thành
  avgScore: number;       // điểm trung bình test (0–100)
  updatedAt: any;
}
