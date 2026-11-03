import { en } from './en';
import { ru } from './ru';
import { uz } from './uz';

export type Dictionary = typeof uz;
export type Locale = 'uz' | 'ru' | 'en';

export const LOCALES: readonly { code: Locale; label: string }[] = [
  { code: 'uz', label: "O'zbekcha" },
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
];

export const dictionaries: Record<Locale, Dictionary> = { uz, ru, en };

export const numberLocales: Record<Locale, string> = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US' };
