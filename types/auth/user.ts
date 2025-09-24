export type Role = 'admin' | 'premium' | 'user' | string;

export type UserDoc = {
  name?: string | null;
  usernameLower?: string | null;
  email?: string | null;
  number?: string | null;
  role?: Role;
  level?: number | null;
  startMode?: string | null;
  createdAt?: any;
};
