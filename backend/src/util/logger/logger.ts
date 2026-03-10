import { createLogger, format, transports, Logger } from "winston";

const { combine, timestamp, printf, colorize, json } = format;

// Custom log format for development (readable)
const devFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp as string} ${level}: ${(stack || message) as string}`;
});

const date: Date = new Date();

const logger: Logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    process.env.NODE_ENV === "production"
      ? json()
      : combine(colorize(), devFormat),
  ),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: `logs/scraper-${date.toISOString().replace(/:/g, "-")}.log`,
    }),
  ],
});

export default logger;
