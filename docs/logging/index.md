# Logging Overview

This project uses [Winston](https://github.com/winstonjs/winston) as its logging solution.

## Setup & Configuration

To enable logging to a specific location, the following environment variable is required:

* `LOGGER_PATH=[absolute_path_to_your_log_dir]`

No further manual setup is needed.

## Usage

There are two ways to use the logger in this project, depending on your context:

### 1. The NestJS Way (Dependency Injection)
**Use this for:** Services, Controllers, Guards, or anywhere inside the NestJS Dependency Injection (DI) context.

First, ensure you import the `UtilModule` into your feature's Module. Then, inject an instance of `AppLogger` into your class constructor:

```typescript
import { Injectable } from '@nestjs/common';
import { AppLogger } from 'root/backend/src/util/logger/logger';

@Injectable()
export class MyService {
  constructor(private readonly logger: AppLogger) {}

  doSomething() {
    this.logger.log('Doing something important...');
  }
}
```

### 2. Direct Import
**Use this for:** Files outside the NestJS DI container (e.g., `main.ts`, custom decorators, or raw utility scripts).

Import the logger straight from its declaration in `root/backend/src/util/logger/logger.ts`:

```typescript
import { logger } from 'root/backend/src/util/logger/logger';

logger.info('Bootstrapping application...');
```
