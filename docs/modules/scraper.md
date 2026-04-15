# Scraper Module

**Category:** Shared/Utility

## Overview

This module is responsible for the VierNulVier scraping engine. It contains the logic to fetch parse, and inject data (like Events, Productions, and Locations) into the database via structured parsing.

## Module Boundaries

### Dependencies
* [Language Module](language.md) for translating scraped multi-lingual text.
* [Logger Module](logger.md) for process logging.
* **ScraperDbModule** for localized database connection handling during scraping.
* [Media Storage Module](media_storage.md) to manage downloaded media assets related to scraped events.

### Exports

This module does not functionally export any services for other feature modules to consume, as the scraping process is designed to run automatically.