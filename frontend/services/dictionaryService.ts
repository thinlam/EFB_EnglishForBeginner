export type Pron = { ipa?: string; audio?: string };
const DICT_ENDPOINT = (w: string) =>
  `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(w)}`;

export async function fetchPronunciationEn(word: string): Promise<Pron | null> {
  try {
    const res = await fetch(DICT_ENDPOINT(word));
    if (!res.ok) return null;
    const data = await res.json();
    const first = Array.isArray(data) ? data[0] : null;
    const phonetics: any[] = first?.phonetics || [];
    const withAudio = phonetics.find((p) => p?.audio) || phonetics[0];
    const ipa: string | undefined =
      withAudio?.text || phonetics.find((p) => p?.text)?.text || undefined;
    const audio: string | undefined = withAudio?.audio || undefined;
    if (!ipa && !audio) return null;
    return { ipa, audio };
  } catch {
    return null;
  }
}
