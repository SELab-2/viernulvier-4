# Media Module

**Category:** Feature

## Overview

This module acts as the metadata layer for media within the application. Rather than managing physical media assets (which is the responsibility of the server and Nginx), it provides structured endpoints for creating and retrieving database records that represent media items, galleries, and crops.

Please note that this module does not perform any actual image manipulation. "Crops" are simply database objects that store cropping parameters (like coordinates or ratios) for the frontend to use. The dedicated storage submodule merely acts as an interface to the server's local file system.

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