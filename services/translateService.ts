// services/translateService.ts
type Lang = 'en' | 'vi';

// ---- CONFIG ----
const GAS_URL = "https://script.google.com/macros/s/AKfycbxGwJwqge0Vw_TMbxF_t4SMOIP8JANc9RW8iorMyOtZpR_TLjWQWd3yAjRM5tNfWcBG/exec" // <-- thay bằng URL /exec của bạn
const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';

// ---- Utils ----
function decodeEntities(s: string) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}
function withTimeout<T>(p: Promise<T>, ms = 7000) {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    p.then(v => { clearTimeout(t); resolve(v); },
           e => { clearTimeout(t); reject(e); });
  });
}

// ---- Providers ----
async function translateWithGAS(text: string, src: Lang, tgt: Lang) {
  const url = `${GAS_URL}?q=${encodeURIComponent(text)}&source=${src}&target=${tgt}`;
  const r = await withTimeout(fetch(url), 7000);
  if (!r.ok) throw new Error(`GAS HTTP ${r.status}`);
  const j = await r.json();
  const out = (j?.translatedText || j?.text || '').toString().trim();
  if (!out) throw new Error('GAS empty');
  return out;
}

async function translateWithMyMemory(
  text: string,
  src: Lang,
  tgt: Lang,
  opts?: { email?: string; useMT?: boolean; timeoutMs?: number }
) {
  const qs = new URLSearchParams({ q: text, langpair: `${src}|${tgt}` });
  if (opts?.useMT) qs.set('mt', '1');
  if (opts?.email) qs.set('de', opts.email);

  const r = await withTimeout(fetch(`${MYMEMORY_URL}?${qs}`), opts?.timeoutMs ?? 7000).catch(() => null);
  if (!r || !r.ok) return text;

  const j = await r.json();
  const matches: { translation?: string; match?: number; quality?: string }[] =
    Array.isArray(j?.matches) ? j.matches : [];

  let best = '', bestScore = -1;
  for (const m of matches) {
    const tr = (m.translation || '').trim();
    if (!tr) continue;
    const score = typeof m.match === 'number' ? m.match : (parseFloat(m.quality || '0') / 100);
    if (score > bestScore) { bestScore = score; best = tr; }
  }

  let out = (bestScore >= 0.8 ? best : (j?.responseData?.translatedText || '')).trim();
  out = decodeEntities(out);
  return out || text;
}

// ---- Public API ----
export async function translateBidirectional(
  text: string,
  src: Lang,
  tgt: Lang,
  opts?: {
    provider?: 'auto' | 'gas' | 'mymemory';
    email?: string;     // MyMemory rate-limit
    useMT?: boolean;    // MyMemory ép MT
    timeoutMs?: number;
  }
): Promise<string> {
  const raw = text?.trim();
  if (!raw) return '';

  const mode = opts?.provider ?? 'auto';

  try {
    if (mode === 'mymemory') return await translateWithMyMemory(raw, src, tgt, opts);
    // GAS first (gas | auto)
    return await translateWithGAS(raw, src, tgt);
  } catch {
    if (mode === 'gas') return raw; // ép GAS mà lỗi → trả nguyên văn
    // auto → fallback MyMemory
    try { return await translateWithMyMemory(raw, src, tgt, opts); }
    catch { return raw; }
  }
}
