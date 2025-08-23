// scripts/secureSession.ts
/**
 * Cross‑platform session store:
 * - Web  : localStorage
 * - Native (iOS/Android): Expo SecureStore
 */
import { Platform } from 'react-native';

let SecureStore: typeof import('expo-secure-store') | null = null;
// Chỉ require khi có gói & khi chạy native
try {
   
  SecureStore = require('expo-secure-store');
} catch {
  SecureStore = null;
}

const KEY = 'user_session';

export type SessionData = {
  uid: string;
  email: string | null;
  role: 'admin' | 'premium' | 'user' | 'maxpremium' | string;
};

/* ---------- helpers (safe JSON) ---------- */
function safeStringify(obj: unknown): string {
  try { return JSON.stringify(obj); } catch { return ''; }
}
function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

/* ---------- WEB BACKEND ---------- */
const webStore = {
  async set(v: string) { localStorage.setItem(KEY, v); },
  async get() { return localStorage.getItem(KEY); },
  async del() { localStorage.removeItem(KEY); },
};

/* ---------- NATIVE BACKEND ---------- */
const nativeStore = {
  async set(v: string) { await SecureStore!.setItemAsync(KEY, v); },
  async get() { return await SecureStore!.getItemAsync(KEY); },
  async del() { await SecureStore!.deleteItemAsync(KEY); },
};

/* ---------- PUBLIC API ---------- */
export async function saveSession(data: SessionData) {
  const payload = safeStringify(data);
  if (!payload) return;

  if (Platform.OS === 'web' || !SecureStore?.setItemAsync) {
    await webStore.set(payload);
  } else {
    await nativeStore.set(payload);
  }
}

export async function getSession<T = SessionData>(): Promise<T | null> {
  const raw =
    Platform.OS === 'web' || !SecureStore?.getItemAsync
      ? await webStore.get()
      : await nativeStore.get();
  return safeParse<T>(raw);
}

export async function clearSession() {
  if (Platform.OS === 'web' || !SecureStore?.deleteItemAsync) {
    await webStore.del();
  } else {
    await nativeStore.del();
  }
}
