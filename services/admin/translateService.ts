// services/translateService.ts

// URL GAS của bạn (Google Apps Script)
const GAS_URL =
  "https://script.google.com/macros/s/AKfycbxGwJwqge0Vw_TMbxF_t4SMOIP8JANc9RW8iorMyOtZpR_TLjWQWd3yAjRM5tNfWcBG/exec";

// MyMemory endpoint (fallback)
const MYMEMORY_URL = "https://api.mymemory.translated.net/get";

// Hàm gọi Google Apps Script
async function translateWithGAS(text: string, source: string, target: string): Promise<string> {
  const res = await fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text, source, target }),
  });
  const json = await res.json();
  return json?.text || "";
}

// Hàm fallback gọi MyMemory
function decodeEntities(s: string) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function decodeMaybe(s: string) {
  try { if (/%[0-9A-Fa-f]{2}/.test(s)) return decodeURIComponent(s); } catch {}
  return s;
}

async function translateWithMyMemory(text: string, source: string, target: string): Promise<string> {
  const url = `${MYMEMORY_URL}?q=${encodeURIComponent(text)}&langpair=${source}|${target}`;
  const res = await fetch(url);
  const json = await res.json();
  let raw: string | undefined = json?.responseData?.translatedText;
  if (!raw && Array.isArray(json?.matches) && json.matches[0]?.translation) {
    raw = json.matches[0].translation;
  }
  if (!raw) return "";
  const cleaned = decodeMaybe(decodeEntities(raw.trim()));
  return cleaned || "";
}

// Hàm chung cho app
export async function translateBidirectional(
  text: string,
  source: "en" | "vi",
  target: "en" | "vi"
): Promise<string> {
  if (!text?.trim()) return "";
  try {
    return await translateWithGAS(text, source, target);
  } catch (err) {
    console.warn("GAS API failed, fallback to MyMemory:", err);
    return await translateWithMyMemory(text, source, target);
  }
}
