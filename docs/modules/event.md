# Event Module

**Category:** Feature

## Overview

This module manages event data. It acts as the central source of truth for managing and viewing raw events and its associated data, which is automatically populated by the VierNulVier scraper and can be added to through the provided endpoints.

## Module Boundaries

This module manages the `events`, `event_locations` and `event_prices` database tables.

### Dependencies

* [Database Module](database.md) for data persistence.
* [Logger Module](logger.md) for application logging.
* [Language Module](language.md) for flattening language responses.

### Provides

* Endpoints for managing events.
* Endpoints for linking prices to specific events.
* Endpoints for linking a specific location to an event.

## Usage & Business Rules

### Scraper Interaction

Because event data is frequently updated by the [Scraper](../scraping/index.md), be cautious when adding manual overrides to these records. Any data that is added independently will stay untouched by the scraper.
