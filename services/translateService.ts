const TRANSLATE_ENDPOINT = 'https://api.mymemory.translated.net/get';

// Giữ lại decode entity, bỏ “xóa khi trùng”
function decodeEntities(s: string) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

export async function translateBidirectional(
  text: string,
  src: 'en' | 'vi',
  tgt: 'en' | 'vi',
  opts?: { useMT?: boolean; email?: string } // email để tăng rate limit MyMemory (&de=)
): Promise<string> {
  const raw = text?.trim();
  if (!raw) return '';

  // Để MyMemory tự chọn tốt nhất (TM trước), KHÔNG ép mt=1 mặc định
  const params = new URLSearchParams({
    q: raw,
    langpair: `${src}|${tgt}`,
  });
  if (opts?.useMT) params.set('mt', '1');
  if (opts?.email) params.set('de', opts.email);

  const url = `${TRANSLATE_ENDPOINT}?${params.toString()}`;

  let res: Response;
  try {
    res = await fetch(url, { method: 'GET' });
  } catch {
    // mạng lỗi → trả luôn nguyên văn (đừng xóa)
    return raw;
  }
  if (!res.ok) {
    // 429/5xx → trả nguyên văn (hoặc bạn có thể ném lỗi để fallback provider)
    return raw;
  }

  const json = await res.json();

  // Ưu tiên best match trong `matches[]` (cao hơn TM/quality)
  const matches: {
    translation?: string;
    match?: number;
    quality?: string;
    segment?: string;
  }[] = Array.isArray(json?.matches) ? json.matches : [];

  // chọn bản có match cao nhất (>=0.80), nếu không có thì lấy responseData
  let best = '';
  let bestScore = -1;
  for (const m of matches) {
    const tr = (m.translation || '').trim();
    if (!tr) continue;
    const score = typeof m.match === 'number' ? m.match : parseFloat(m.quality || '0') / 100;
    if (score > bestScore) {
      bestScore = score;
      best = tr;
    }
  }

  let out = (bestScore >= 0.8 ? best : (json?.responseData?.translatedText || '')).trim();

  // Giải entity HTML, KHÔNG xoá nếu trùng
  out = decodeEntities(out);

  // Nếu MyMemory “cứng đầu” trả rỗng, đừng trả '' → trả nguyên văn để UI không mất chữ
  if (!out) out = raw;

  return out;
}
