# Scraper Module

**Category:** Shared/Utility

## Overview

This module is responsible for the VierNulVier scraping engine. It contains the logic to fetch, parse, and inject data (like Events, Productions, and Locations) into the database via structured parsing and CSV injection.

## Module Boundaries

### Dependencies
* [Language Module](language.md) for translating scraped multi-lingual text.
* [Logger Module](logger.md) for process logging.
* **ScraperDbModule** for localized database connection handling during scraping.
* [Media Storage Module](media_storage.md) to manage downloaded media assets related to scraped events.

### Exports
* `ScraperService`, `ScraperEngine`, `ScraperRunner`, and `CsvInjectionService`.