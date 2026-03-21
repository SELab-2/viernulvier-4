# Auth Module

**Category:** Core

## Overview

This module provides endpoints for user authentication (log-in) and API key distribution. It also provides exclusive endpoints for the `super-admin` role to provision additional accounts and generate new keys.

## Module Boundaries

This module exposes endpoints for managing accounts and API keys.

* **Dependencies:** Relies on the [Database Module](database.md) to verify user credentials and store hashed keys.

The module itself does not export anything because the Guards used for authentication are Global entities.

## Usage & Business Rules

### Securing Routes

To protect a new endpoint, apply the `@UseGuards(ApiKeyGuard)` decorator to your controller method. If you want the endpoint to only be accessible for the `super-admin` role, apply the `@UseGuards(SuperApiKeyGuard)` decorator.

### Super-Admin

The Super-Admin bypasses all role checks. Super-Admin accounts have to be created directly in the database.

### API Key Format

Clients must pass the generated API Key in the `x-api-key` header for all protected requests.
