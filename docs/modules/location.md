# Location Module

**Category:** Feature

## Overview

This module manages location data. It acts as the central source of truth for managing and viewing raw locations, which is automatically populated by the VierNulVier scraper and can be added to through the provided endpoints.

## Module Boundaries

This module manages the `locations` database table.

### Dependencies

* [Database Module](database.md) for data persistence.
* [Logger Module](logger.md) for application logging.
* [Language Module](language.md) for data translation.

### Provides

* Endpoints for managing locations.

## Usage & Business Rules

### Scraper Interaction

Because location data is frequently updated by the [Scraper](../scraping/index.md), be cautious when adding manual overrides to these records. Any data that is added independently will stay untouched by the scraper.

### API conversion

Location data is the same as Hall data on the VierNulVier API. We have chosen to merge Hall, Location and Space into one Location object.
