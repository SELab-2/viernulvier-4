# Media Module

**Category:** Feature

## Overview

This module manages all media assets within the application. It provides structured endpoints for uploading, cropping, categorizing (galleries), and retrieving media items. It leverages a dedicated storage submodule to handle the physical or cloud-based file storage.

## Module Boundaries

This module manages media-related database tables (such as `media_items`, `media_galleries`, and `media_crops`). All media routes are grouped under the `/media` path via the app router.

### Dependencies

* [Database Module](database.md) for data persistence.
* [Logger Module](logger.md) for application logging.
* [Language Module](language.md) for flattening language responses.
* **MediaStorageModule** (Internal) for handling actual file storage and API key verification.

### Provides

* Endpoints for managing individual media items.
* Endpoints for managing media galleries.
* Endpoints for handling media crops.