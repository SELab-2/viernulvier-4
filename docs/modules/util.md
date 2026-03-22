# Util Modules

**Category:** Shared/Utility

## Overview

This module has been split into three separate modules: `LoggerModule`, `LanguageModule`, and `ScraperModule`.

## Modules

### LoggerModule

Provides the `AppLogger`. No dependencies.

### LanguageModule

Provides the `LanguageService` for flattening and translating multi-lingual data. Depends on `LoggerModule`.

### ScraperModule

Provides the `ScraperService`, `ScraperEngine`, and `ScraperRunner`. Depends on `LanguageModule`, `LoggerModule`, and
`ScraperDbModule`.

## Usage

Import only the module you need into your feature module:

```typescript
@Module({
  imports: [LoggerModule],
})
```

See the [Logging Overview](../logging.md) for specific `AppLogger` examples.