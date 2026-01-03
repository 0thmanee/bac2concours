/**
 * i18n Configuration
 * Central configuration for internationalization
 */

import { en } from "./dictionaries/en";
import { fr } from "./dictionaries/fr";

// Supported locales
export const locales = ["en", "fr"] as const;
export type Locale = (typeof locales)[number];

// Default locale
export const defaultLocale: Locale = "en";

// Dictionary map
const dictionaries = {
  en,
  fr,
};

/**
 * Get dictionary for a specific locale
 * Falls back to default locale if not found
 */
export function getDictionary(locale: Locale = defaultLocale) {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

/**
 * Type-safe dictionary accessor
 */
export type Dictionary = typeof en;

// Type for nested dictionary values (recursive structure)
type NestedDictionaryValue = string | { [key: string]: NestedDictionaryValue };

/**
 * Get nested value from dictionary using dot notation
 * Example: t("admin.startups.title")
 */
export function t(
  key: string,
  dictionary: Dictionary,
  params?: Record<string, string | number>
): string {
  const keys = key.split(".");
  let value: NestedDictionaryValue =
    dictionary as unknown as NestedDictionaryValue;

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }

  if (typeof value !== "string") {
    console.warn(`Translation value is not a string: ${key}`);
    return key;
  }

  // Replace parameters if provided
  if (params) {
    return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey]?.toString() ?? match;
    });
  }

  return value;
}

/**
 * Hook for accessing translations (for future use with Context)
 * Currently returns the dictionary directly
 */
export function useTranslations(locale: Locale = defaultLocale) {
  const dictionary = getDictionary(locale);

  return {
    t: (key: string, params?: Record<string, string | number>) =>
      t(key, dictionary, params),
    dict: dictionary,
  };
}
