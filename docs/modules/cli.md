# CLI Module

**Category:** Core / Tooling

## Overview

This module is used to bundle loose scripts, such as the database reset script and the old CSV parser entry point. Grouping them in this module ensures that they can be run with the correct dependencies injected.

## Module Boundaries

Instead of importing the standard feature modules, the CLI module manually registers specific utility and scraper services as providers to independently execute its commands.

### Dependencies

* **ConfigModule** for accessing global environment variables.

### Provides / Commands

* `ResetDbCommand`: A command used to reset the scraper database state.
* `InjectStructuredCsvTest`: A command to trigger and test structured CSV data injection.
* Internal provisions of `AppLogger`, `LanguageService`, `UtilsDbConnection`, and `InjectCsvEngine` necessary to run the commands.