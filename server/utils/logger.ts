/**
 * Logger class implementing a Singleton pattern using Pino logger
 */
import pino, { Logger as PinoLogger } from "pino";
import moment from "moment";

export class Logger {
  private static instance: Logger;
  private logger: PinoLogger;

  private constructor() {
    this.logger = pino({
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true, // Enables colorized output
        },
      },
      level: process.env.LOG_LEVEL || "info", // Set log level from environment variable or default to 'info'
      base: {
        pid: false, // Disable PID in log output
      },
      // Format timestamp using moment
      timestamp: () =>
        `,"time":"${moment().format("YYYY-MM-DD HH:mm:ss.SSS")}"`,
    });
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Log info level message
   * @param message - Message to log
   * @param args - Additional arguments to log
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info(message: string, ...args: any[]): void {
    this.logger.info(message, ...args);
  }

  /**
   * Log error level message
   * @param message - Error message to log
   * @param error - Error object
   * @param args - Additional arguments to log
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(message: string, error?: Error, ...args: any[]): void {
    this.logger.error({ err: error, ...args }, message);
  }

  /**
   * Log warning level message
   * @param message - Warning message to log
   * @param args - Additional arguments to log
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn(message: string, ...args: any[]): void {
    this.logger.warn(message, ...args);
  }

  /**
   * Log debug level message
   * @param message - Debug message to log
   * @param args - Additional arguments to log
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug(message: string, ...args: any[]): void {
    this.logger.debug(message, ...args);
  }
}

// Export default singleton instance
export default Logger.getInstance();
