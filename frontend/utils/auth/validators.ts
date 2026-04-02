// Regex email cơ bản
export const isEmail = (s: string) => /\S+@\S+\.\S+/.test(s);
