# Print Module

**Category:** Feature

## Overview

This module manages the prints within the archive. These prints can either be leaflets/booklets, posters, prints or programs.

## Module Boundaries

This module typically manages the `print_items` database table.

### Dependencies

* [Database Module](database.md) for data persistence.
* [Logger Module](logger.md) for application logging.
* [Language Module](language.md) for handling multi-lingual fields.

### Provides

* Endpoints for managing and retrieving print items.