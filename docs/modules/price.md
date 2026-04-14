# Price Module

**Category:** Feature

## Overview

This module manages price data. It acts as the central source of truth for managing and viewing raw prices, which is automatically populated by the VierNulVier scraper and can be added to through the provided endpoints.

## Module Boundaries

This module manages the `prices` database table.

### Dependencies

* [Database Module](database.md) for data persistence.
* [Logger Module](logger.md) for application logging.
* [Language Module](language.md) for data translation.

### Provides

* Endpoints for managing prices.

## Usage & Business Rules

### Scraper Interaction

Because price data is frequently updated by the [Scraper](../scraping/index.md), be cautious when adding manual overrides to these records. Any data that is added independently will stay untouched by the scraper.

### API conversion

Price objects here are a merged object consisting of the `Event Price` and `Price` objects in the VierNulVier API. This will result in quite a lot more columns and duplicated names, but is a way less overkill way of storing these.
