# i18n Implementation Guide

## Overview

This project uses a modern, type-safe dictionary-based internationalization system that can easily scale to multiple languages.

## Architecture

### Dictionary Files (`/lib/i18n/dictionaries/`)

- **en.ts**: English dictionary (primary/default)
- **fr.ts**: French dictionary (example)
- Each dictionary contains all platform text organized by feature

### Core Files

- **`/lib/i18n/index.ts`**: Core i18n utilities and configuration
- **`/lib/i18n/provider.tsx`**: React Context for client-side locale management
- **`/components/language-switcher.tsx`**: UI component for changing languages

## Usage

### 1. Wrap Your App with I18nProvider

```tsx
// app/layout.tsx
import { I18nProvider } from "@/lib/i18n/provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <I18nProvider initialLocale="en">{children}</I18nProvider>
      </body>
    </html>
  );
}
```

### 2. Using Translations in Components

#### Method 1: Direct Dictionary Access (Recommended for type-safety)

```tsx
"use client";

import { useDict } from "@/lib/i18n/provider";

export function MyComponent() {
  const dict = useDict();

  return (
    <div>
      <h1>{dict.admin.startups.title}</h1>
      <p>{dict.admin.startups.description}</p>
      <button>{dict.common.save}</button>
    </div>
  );
}
```

#### Method 2: Translation Function (For dynamic keys or parameters)

```tsx
"use client";

import { useT } from "@/lib/i18n/provider";

export function MyComponent() {
  const t = useT();

  return (
    <div>
      <h1>{t("admin.startups.title")}</h1>
      {/* With parameters */}
      <p>{t("validation.minLength", { min: 8 })}</p>
    </div>
  );
}
```

#### Method 3: Full Context Access

```tsx
"use client";

import { useI18n } from "@/lib/i18n/provider";

export function MyComponent() {
  const { locale, setLocale, dict, t } = useI18n();

  return (
    <div>
      <p>Current locale: {locale}</p>
      <h1>{dict.admin.startups.title}</h1>
      <button onClick={() => setLocale("fr")}>Switch to French</button>
    </div>
  );
}
```

### 3. Adding the Language Switcher

```tsx
// In your sidebar or header
import { LanguageSwitcher } from "@/components/language-switcher";

export function Header() {
  return (
    <header>
      <nav>{/* Your navigation */}</nav>
      <LanguageSwitcher />
    </header>
  );
}
```

## Adding New Languages

### Step 1: Create Dictionary File

```ts
// lib/i18n/dictionaries/es.ts
import type { Dictionary } from "./en";

export const es: Dictionary = {
  common: {
    loading: "Cargando...",
    save: "Guardar",
    // ... rest of translations
  },
  // ... rest of sections
};
```

### Step 2: Update Configuration

```ts
// lib/i18n/index.ts
import { es } from "./dictionaries/es";

export const locales = ["en", "fr", "es"] as const;

const dictionaries = {
  en,
  fr,
  es, // Add new language
};
```

### Step 3: Update Language Switcher

```tsx
// components/language-switcher.tsx
const languageNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  es: "Español", // Add new language
};

const languageFlags: Record<Locale, string> = {
  en: "🇬🇧",
  fr: "🇫🇷",
  es: "🇪🇸", // Add new flag
};
```

## Dictionary Structure

```ts
{
  common: { /* Shared UI text */ },
  auth: { /* Authentication related */ },
  nav: { /* Navigation items */ },
  admin: {
    dashboard: { /* Admin dashboard */ },
    startups: { /* Startups management */ },
    budgets: { /* Budget management */ },
    expenses: { /* Expense management */ },
    settings: { /* Settings */ },
    reports: { /* Reports */ },
  },
  founder: { /* Founder-specific content */ },
  errors: { /* Error messages */ },
  validation: { /* Form validation messages */ },
  loading: { /* Loading states */ },
  empty: { /* Empty states */ },
}
```

## Benefits

### ✅ Type Safety

- Full TypeScript support
- Autocomplete for all dictionary keys
- Compile-time error checking

### ✅ Performance

- No runtime bundle splitting
- Tree-shakeable
- Client-side locale switching without reload

### ✅ Developer Experience

- Single source of truth for all text
- Easy to find and update translations
- Organized by feature

### ✅ Scalability

- Easy to add new languages
- Support for parameter interpolation
- Locale persistence in localStorage

### ✅ Maintainability

- Centralized text management
- Easy to audit missing translations
- TypeScript enforces dictionary structure

## Best Practices

1. **Always use the dictionary** - Never hardcode text in components
2. **Prefer `useDict()`** - Type-safe and better autocomplete
3. **Group by feature** - Keep related translations together
4. **Use descriptive keys** - `admin.startups.create.title` not `text1`
5. **Add comments** - Document complex translation strings
6. **Keep it flat when possible** - Avoid deep nesting beyond 4 levels
7. **Use parameters** - For dynamic content: `validation.minLength` with `{min}` param

## Migration Strategy

To migrate existing hardcoded text:

1. Search for hardcoded strings in components
2. Add them to the appropriate dictionary section
3. Replace with dictionary access: `dict.section.key`
4. Test in multiple languages
5. Remove old hardcoded strings

Example:

```tsx
// Before
<h1>Startups</h1>;

// After
const dict = useDict();
<h1>{dict.admin.startups.title}</h1>;
```

## Future Enhancements

- Server-side locale detection from Accept-Language header
- URL-based locale routing (`/en/dashboard`, `/fr/dashboard`)
- Pluralization support
- Date/number formatting per locale
- RTL (Right-to-Left) language support
- Translation management UI
- Automatic translation with AI
