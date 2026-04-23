import { Injectable, LoggerService } from "@nestjs/common";
import winstonLogger from "./logger";

/**
 * Custom Logger that uses Winston to save logs for the project.
 */
@Injectable()
export class AppLogger implements LoggerService {
  /**
   * Safely formats a message for the Winston logger.
   * @param message The message we want to format.
   * @returns The formatted message as a string.
   */
  private formatMessage(message: unknown): string {
    if (typeof message === "string") {
      return message;
    }
    if (message instanceof Error) {
      return message.stack || message.message;
    }
    try {
      return JSON.stringify(message);
    } catch {
      return String(message);
    }
  }

  log(message: any, ...optionalParams: any[]) {
    winstonLogger.info(this.formatMessage(message), optionalParams);
  }

  error(message: any, trace?: string, context?: string) {
    winstonLogger.error(this.formatMessage(message), { trace, context });
  }

  warn(message: any, context?: string) {
    winstonLogger.warn(this.formatMessage(message), { context });
  }

  debug(message: any, context?: string) {
    winstonLogger.debug(this.formatMessage(message), { context });
  }

  verbose(message: any, context?: string) {
    winstonLogger.verbose(this.formatMessage(message), { context });
  }
}
