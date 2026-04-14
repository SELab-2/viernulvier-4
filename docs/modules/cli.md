# CLI Module

**Category:** Core / Tooling

## Overview

This module provides the command-line interface (CLI) infrastructure for the application. It acts as an alternative entry point to the standard HTTP server, allowing developers to run administrative scripts, utility commands, and testing tasks directly from the terminal.

## Module Boundaries

Instead of importing the standard feature modules, the CLI module manually registers specific utility and scraper services as providers to independently execute its commands.

### Dependencies

* **ConfigModule** for accessing global environment variables.

### Provides / Commands

* `ResetDbCommand`: A command used to reset the scraper database state.
* `InjectStructuredCsvTest`: A command to trigger and test structured CSV data injection.
* Internal provisions of `AppLogger`, `LanguageService`, `UtilsDbConnection`, and `InjectCsvEngine` necessary to run the commands.