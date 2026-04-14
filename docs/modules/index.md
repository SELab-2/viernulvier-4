# Nest Modules Overview

Our backend is built using [NestJS](https://nestjs.com/), as mentioned in [Server](../server/index.md) which relies heavily on a modular architecture to keep the codebase organized, scalable, and loosely coupled.

The following pages cover the specific modules defined throughout our backend. To make navigation easier, they are grouped into their architectural categories.

## 1. Feature Modules

These modules encapsulate specific business domains. They contain the controllers, services, and business logic for these areas.

* **[Production Module](production.md)** - *Manages production data and its associated entities.*
* **[Event Module](event.md)** - *Handles the lifecycle and details of scheduled events.*
* **[Tag Module](tag.md)** - *Manages categorization tags used across the platform.*
* **[Blog Module](blog.md)** - *Takes care of any blogs added to the archive.*
* **[Location Module](location.md)** - *Handles the different locations events can be at.*
* **[Price Module](price.md)** - *Handles the different types of prices events can have.*
* **[Media Module](media.md)** - *Manages media assets, galleries, crops, and storage.*
* **[Print Item Module](print_item.md)** - *Manages print items.*
* **[Parser Module](parser.md)** - *Handles parsing interactions via the scraper.*

## 2. Core Modules

These modules handle application-wide infrastructure. They are typically imported only once in the root `AppModule`.

* **[Database Module](database.md)** - *Configuration and connection pooling.*
* **[Auth Module](auth.md)** - *Authentication and authorization guards.*
* **[CLI Module](cli.md)** - *Provides command-line interface commands for administrative tasks.*

## 3. Shared/Utility Modules

These are helper modules that provide reusable services across multiple feature modules. The legacy Util module has been split into three focused modules.

* **[Logger Module](logger.md)** - *Provides the central AppLogger service.*
* **[Language Module](language.md)** - *Handles language formatting and translation.*
* **[Scraper Module](scraper.md)** - *Provides the scraping engine and database interactions.*