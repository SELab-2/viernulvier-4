# Production Module

**Category:** Feature

## Overview

This module manages production data. It acts as the central source of truth for managing and viewing raw productions and its associated data, which is automatically populated by the VierNulVier scraper and can be added to through the provided endpoints.

## Module Boundaries

This module manages the `productions`, `production_blogs` and `production_tag` database tables.

### Dependencies

* [Database Module](database.md) for data persistence.
* [Util Module](util.md) for utilities.

### Provides

* Endpoints for managing productions.
* Endpoints for linking tags to specific productions.
* Endpoints for linking blogs to specific productions.

## Usage & Business Rules

### Scraper Interaction

Because production data is frequently updated by the [Scraper](../scraping/index.md), be cautious when adding manual overrides to these records. Any data that is added independently will stay untouched by the scraper.
