export type Role = 'admin' | 'premium' | 'Maxpremium' | 'user' | string;

export type UserAdmin = {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: Role | null;
  number?: string | null;
  level?: number | string | null;
  startMode?: string | null;
  // ... thêm field khác nếu cần hiện trong admin
};
