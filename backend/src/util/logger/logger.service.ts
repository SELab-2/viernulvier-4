import { Injectable, LoggerService } from "@nestjs/common";
import winstonLogger from "./logger";

/**
 * Custom Logger that uses Winston to save logs for the project.
 */
@Injectable()
export class AppLogger implements LoggerService {
  log(message: any, ...optionalParams: any[]) {
    winstonLogger.info(message, optionalParams);
  }

  error(message: any, trace?: string, context?: string) {
    winstonLogger.error(message, { trace, context });
  }

  warn(message: any, context?: string) {
    winstonLogger.warn(message, { context });
  }

  debug(message: any, context?: string) {
    winstonLogger.debug(message, { context });
  }

  verbose(message: any, context?: string) {
    winstonLogger.verbose(message, { context });
  }
}
