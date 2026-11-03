import type { Locale } from '@/i18n/dictionaries';

const SOURCE_LOCALE: Locale = 'ru';
const cache = new Map<string, string>();

export async function translateText(text: string, target: Locale): Promise<string> {
  if (!text || target === SOURCE_LOCALE) return text;
  const key = `${target}:${text}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const url =
    'https://translate.googleapis.com/translate_a/single?client=gtx&dt=t' +
    `&sl=${SOURCE_LOCALE}&tl=${target}&q=${encodeURIComponent(text)}`;
  const response = await fetch(url);
  if (!response.ok) return text;
  const data: unknown = await response.json();
  if (!Array.isArray(data) || !Array.isArray(data[0])) return text;

  const translated = (data[0] as unknown[])
    .map((chunk) => (Array.isArray(chunk) && typeof chunk[0] === 'string' ? chunk[0] : ''))
    .join('');
  if (!translated) return text;
  cache.set(key, translated);
  return translated;
}
