const TRANSLATE_ENDPOINT = 'https://api.mymemory.translated.net/get';

function decodeMaybe(s: string) {
  try { if (/%[0-9A-Fa-f]{2}/.test(s)) return decodeURIComponent(s); } catch {}
  return s;
}

export async function translateEnToVi(text: string): Promise<string | null> {
  try {
    const url = `${TRANSLATE_ENDPOINT}?q=${encodeURIComponent(text)}&langpair=en|vi`;
    const res = await fetch(url, { method: 'GET' });
    const json = await res.json();
    const raw: string | undefined = json?.responseData?.translatedText;
    if (!raw) return null;
    const cleaned = decodeMaybe(
      raw
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim()
    );
    return cleaned || null;
  } catch {
    return null;
  }
}
