import { useCallback } from 'react';

import { claims, type ClaimKey } from '@/content/claims';
import { t as translate, tc as translateClaim, type I18nKey } from '@/i18n';
import { useApp } from '@/state/AppProvider';

/** Übersetzungen, die bei Sprachwechsel neu rendern. */
export function useT() {
  const { locale } = useApp();
  const t = useCallback(
    (key: I18nKey, params?: Record<string, string | number>) => translate(key, params, locale),
    [locale],
  );
  const tc = useCallback(
    (key: ClaimKey, params?: Record<string, string | number>) => translateClaim(key, params, locale),
    [locale],
  );
  const pick = useCallback(<T,>(pair: { de: T; en: T }): T => pair[locale], [locale]);
  return { t, tc, pick, locale, claims };
}
