# Blog Module

**Category:** Feature

## Overview

This module manages blog data. It acts as the central source of truth for managing and viewing raw blogs. Blogs are an exclusive resource to the Archive.

## Module Boundaries

This module manages the `blogs` database table.

### Dependencies

* [Database Module](database.md) for data persistence.
* [Logger Module](logger.md) for application logging.
* [Language Module](language.md) for flattening language responses.

### Provides

* Endpoints for managing blogs.
