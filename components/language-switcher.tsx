"use client";

/**
 * Language Switcher Component
 * Allows users to change the interface language
 */

import { useI18n } from "@/lib/i18n/provider";
import { locales, type Locale } from "@/lib/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";

const languageNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
};

const languageFlags: Record<Locale, string> = {
  en: "🇬🇧",
  fr: "🇫🇷",
};

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <Select value={locale} onValueChange={(value) => setLocale(value as Locale)}>
      <SelectTrigger className="w-40">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <SelectValue>
            <span className="flex items-center gap-2">
              <span>{languageFlags[locale]}</span>
              <span>{languageNames[locale]}</span>
            </span>
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {locales.map((loc) => (
          <SelectItem key={loc} value={loc}>
            <span className="flex items-center gap-2">
              <span>{languageFlags[loc]}</span>
              <span>{languageNames[loc]}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
