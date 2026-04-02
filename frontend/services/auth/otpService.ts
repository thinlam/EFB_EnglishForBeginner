// ⚠️ ĐƯA VÀO .env KHI PROD (EXPO_PUBLIC_API_BASE)
const API_BASE = 'https://otp-server-production-6c26.up.railway.app';

export const ENDPOINTS = {
  SEND_OTP: `${API_BASE}/send-otp`,
  // VERIFY_OTP: `${API_BASE}/verify-otp`, // PROD bật khi cần
};

// fetch timeout helper (RN không có sẵn)
async function fetchWithTimeout(resource: RequestInfo, options: RequestInit = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(resource, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}

export async function sendOtpApi(email: string): Promise<any> {
  const res = await fetchWithTimeout(ENDPOINTS.SEND_OTP, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  }, 15000);
  const data = await res.json().catch(() => ({}));
  return data;
}

/* PROD ONLY
export async function verifyOtpApi(args: { email: string; transactionId: string; otp: string }): Promise<any> {
  const res = await fetchWithTimeout(ENDPOINTS.VERIFY_OTP, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  }, 15000);
  const data = await res.json().catch(() => ({}));
  return data;
}
*/
