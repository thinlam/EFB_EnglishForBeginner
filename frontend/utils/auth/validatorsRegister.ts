export const normalize = (s: string) => s?.trim();
export const isEmail = (s: string) => /\S+@\S+\.\S+/.test(s);
export const strongEnough = (s: string) => s.length >= 6; // tùy policy
export const isVNPhone = (s: string) => /^\d{10}$/.test(s);
