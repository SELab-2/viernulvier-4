# Util Module

**Category:** Shared/Utility

## Overview

This module acts as a container for shared, stateless utility services that are used across multiple different feature modules, such as our logging implementation.

## Module Boundaries

### Dependencies 

None.

### Provides

* The `AppLogger`.
* The `Scraper` provider. See [Scraper](../scraping/index.md) for more info.
* The `Language` provider that helps with flattening multi-lingual representations of data.

## Usage 

To use a utility like the `AppLogger`, simply import the `UtilModule` into your feature module and inject the required service into your constructor. See the [Logging Overview](../logging.md) for specific examples.
