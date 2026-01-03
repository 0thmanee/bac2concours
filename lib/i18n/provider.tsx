"use client";

/**
 * i18n Context and Provider
 * Client-side context for managing locale state
 */

import React, { createContext, useContext, useState, useCallback } from "react";
import { getDictionary, type Locale, type Dictionary, defaultLocale, t as translateFn } from "./index";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dict: Dictionary;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

interface I18nProviderProps {
  children: React.ReactNode;
  initialLocale?: Locale;
}

export function I18nProvider({ children, initialLocale = defaultLocale }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [dict, setDict] = useState<Dictionary>(() => getDictionary(initialLocale));

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    setDict(getDictionary(newLocale));
    // Persist to localStorage for future sessions
    if (typeof window !== "undefined") {
      localStorage.setItem("locale", newLocale);
    }
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      return translateFn(key, dict, params);
    },
    [dict]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, dict, t }}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * Hook to access i18n context
 */
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

/**
 * Hook to access dictionary directly (type-safe)
 */
export function useDict() {
  const { dict } = useI18n();
  return dict;
}

/**
 * Hook to access translation function
 */
export function useT() {
  const { t } = useI18n();
  return t;
}
