import { getLocales } from 'expo-localization';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { readJson, StorageKeys, writeJson } from '@/lib/storage';
import { formatPrice } from '@/lib/format';
import { dictionaries, type Dictionary, type Locale } from './dictionaries';

interface LocaleContextValue {
  locale: Locale;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
  price: (value: number) => string;
  ready: boolean;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function detectDeviceLocale(): Locale {
  for (const { languageCode } of getLocales()) {
    if (languageCode === 'uz' || languageCode === 'ru' || languageCode === 'en') return languageCode;
  }
  return 'uz';
}

export function LocaleProvider({ children }: PropsWithChildren) {
  const [locale, setLocaleState] = useState<Locale>(detectDeviceLocale);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    readJson<Locale>(StorageKeys.locale).then((saved) => {
      if (saved && saved in dictionaries) setLocaleState(saved);
      setReady(true);
    });
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    writeJson(StorageKeys.locale, next);
  }, []);

  const value = useMemo<LocaleContextValue>(() => {
    const t = dictionaries[locale];
    return {
      locale,
      t,
      setLocale,
      price: (amount: number) => formatPrice(amount, t.common.currency),
      ready,
    };
  }, [locale, ready, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used inside LocaleProvider');
  return context;
}
