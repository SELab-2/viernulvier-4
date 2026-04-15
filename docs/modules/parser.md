# Parser Module

**Category:** Feature

## Overview

The Parser Module serves as the interface between external triggers (like API calls) and the internal scraping engine. It allows administrative users to trigger specific parsing or scraping tasks via dedicated endpoints.

## Module Boundaries

This module acts as a high-level controller layer that orchestrates the capabilities of the `Scraper Module`.

### Dependencies

* [Scraper Module](scraper.md) to execute the actual parsing and inserting logic.
* [Database Module](database.md) for verifying permissions or accessing task-related data.
* [Language Module](language.md) for flattening language responses.

### Provides

* Endpoints to manually trigger or monitor parsing and scraping processes.