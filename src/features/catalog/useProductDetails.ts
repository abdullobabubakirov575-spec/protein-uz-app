import { useEffect, useState } from 'react';

import { fetchProduct } from '@/api/catalog';
import type { Product } from '@/api/types';
import { translateText } from '@/api/translate';
import { useLocale } from '@/i18n/LocaleProvider';
import { useCatalog } from './CatalogProvider';

type DetailsStatus = 'loading' | 'ready' | 'error';

const tidy = (text: string) => text.trim().replace(/([.!?])(?=[A-ZА-ЯЁ])/g, '$1 ');

interface ProductDetailsState {
  product: Product | undefined;
  description: string;
  status: DetailsStatus;
  reload: () => void;
}

export function useProductDetails(id: string): ProductDetailsState {
  const { locale } = useLocale();
  const { productById } = useCatalog();
  const cached = productById(id);
  const [fetched, setFetched] = useState<Product | undefined>();
  const [original, setOriginal] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<DetailsStatus>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    fetchProduct(id)
      .then((details) => {
        if (cancelled) return;
        setFetched(details);
        setOriginal(tidy(details.description ?? ''));
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [id, attempt]);

  useEffect(() => {
    let cancelled = false;
    setDescription(original);
    if (!original) return;
    translateText(original, locale)
      .then((text) => {
        if (!cancelled) setDescription(text);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [original, locale]);

  return {
    product: fetched ?? cached,
    description,
    status,
    reload: () => setAttempt((value) => value + 1),
  };
}
