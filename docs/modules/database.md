# Database Module

**Category:** Core

## Overview

This module is responsible for initializing and managing the connection to the underlying database. It handles the connection pooling for the entire backend and delivers methods for querying the database.

## Module Boundaries

### Dependencies

Relies on environment variables (e.g., database URL, credentials) for configuration. The full list of environment variables is listed in [Server](../server/index.md).

### Exports

Exports the database connection and base repository providers so that Feature Modules can call their respective queries.

## Usage & Business Rules

### Connection Handling

Feature modules should never initialize their own database connections. They must import the `DatabaseModule` (or rely on the global connection) to inject their repositories.
