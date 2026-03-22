# Translation Guide

## Overview

The `LanguageService` handles translation via an external provider. The current provider is **DeepL**. The single
required environment variable is `TRANSLATE_API_KEY`.

---

## Usage

**Translate all fields on an object:**

```typescript
const translated = await languageService.translateObject<Product>(product, 'nl', 'fr');
```

This walks every field and adds the target language to any translatable sub-object (e.g. `{ nl: "Hallo" }` becomes
`{ nl: "Hallo", fr: "Bonjour" }`). Existing translations are never overwritten.

**Translate a single field:**

```typescript
const result = await languageService.translateText({ nl: 'Hallo wereld' }, 'nl', 'fr');
// => { nl: 'Hallo wereld', fr: 'Bonjour le monde' }
```

---

## Switching Providers

To swap DeepL for another provider (e.g. Google Translate or LibreTranslate), three things need to change:

### 1. Constructor — swap the SDK

Replace the `deepl-node` import and `Translator` instantiation with your new provider's SDK.

```typescript
// change this constructor when changing provider.
const apiKey = process.env.TRANSLATE_API_KEY;
this.translator = new deepl.Translator(apiKey);
```

### 2. `translateText` — swap the API call

Replace the `this.translator.translateText(...)` call with your provider's equivalent. The surrounding logic (null
checks, fallback, rate limiting) can stay as-is.

```typescript
const result = await this.translator.translateText(
  sourceText,
  this.formatSourceLanguageHelper(langFrom),
  this.formatTargetLanguageHelper(langTo),
);
data[langTo] = result.text;
```

### 3. Format helpers — adjust language codes

Each provider uses slightly different language code conventions. Update `formatSourceLanguageHelper` and
`formatTargetLanguageHelper` accordingly.

| Language | DeepL             | Google | LibreTranslate |
|----------|-------------------|--------|----------------|
| English  | `en-GB` / `en-US` | `en`   | `en`           |
| Dutch    | `NL`              | `nl`   | `nl`           |
| French   | `FR`              | `fr`   | `fr`           |

> LibreTranslate uses plain ISO 639-1 codes everywhere, so it requires the least normalisation.

---

## Rate Limiting

The 100 ms delay after each call is a basic safeguard. Adjust or remove it depending on your provider's plan. For bulk
jobs, consider a proper queue instead.