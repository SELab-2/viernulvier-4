# Tag Module

**Category:** Feature

## Overview

This module manages tag data. It acts as the central source of truth for managing and viewing raw tags, which is automatically populated by the VierNulVier scraper and can be added to through the provided endpoints.

## Module Boundaries

This module manages the `tags` database table.

### Dependencies

* [Database Module](database.md) for data persistence.
* [Logger Module](logger.md) for application logging.
* [Language Module](language.md) for flattening language responses.

### Provides

* Endpoints for managing tags.

## Usage & Business Rules

### Scraper Interaction

Because tag data is frequently updated by the [Scraper](../scraping/index.md), be cautious when adding manual overrides to these records. Any data that is added independently will stay untouched by the scraper.

### API conversion

Tags in the original VierNulVier API are called `Genres`. We have opted here to rename this to tags because we felt it was a more suitable name.
