/**
 * Centralized logging utility
 * Provides consistent logging with levels and production-safe behavior
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
};

// Determine current log level based on environment
const getLogLevel = () => {
  if (import.meta.env.PROD) {
    // In production, only show errors and warnings
    return LOG_LEVELS.WARN;
  }
  // In development, show all logs
  return LOG_LEVELS.DEBUG;
};

const currentLogLevel = getLogLevel();

/**
 * Logger utility class
 */
class Logger {
  /**
   * Log debug message (only in development)
   * @param {string} message - Message to log
   * @param {any} data - Optional data to log
   */
  debug(message, data = null) {
    if (currentLogLevel <= LOG_LEVELS.DEBUG) {
      if (data) {
        console.debug(`[DEBUG] ${message}`, data);
      } else {
        console.debug(`[DEBUG] ${message}`);
      }
    }
  }

  /**
   * Log info message
   * @param {string} message - Message to log
   * @param {any} data - Optional data to log
   */
  info(message, data = null) {
    if (currentLogLevel <= LOG_LEVELS.INFO) {
      if (data) {
        console.info(`[INFO] ${message}`, data);
      } else {
        console.info(`[INFO] ${message}`);
      }
    }
  }

  /**
   * Log warning message
   * @param {string} message - Message to log
   * @param {any} data - Optional data to log
   */
  warn(message, data = null) {
    if (currentLogLevel <= LOG_LEVELS.WARN) {
      if (data) {
        console.warn(`[WARN] ${message}`, data);
      } else {
        console.warn(`[WARN] ${message}`);
      }
    }
  }

  /**
   * Log error message
   * @param {string} message - Message to log
   * @param {Error|any} error - Error object or data to log
   */
  error(message, error = null) {
    if (currentLogLevel <= LOG_LEVELS.ERROR) {
      if (error) {
        if (error instanceof Error) {
          console.error(`[ERROR] ${message}`, error.message, error.stack);
        } else {
          console.error(`[ERROR] ${message}`, error);
        }
      } else {
        console.error(`[ERROR] ${message}`);
      }
    }
  }

  /**
   * Log message (alias for info)
   * @param {string} message - Message to log
   * @param {any} data - Optional data to log
   */
  log(message, data = null) {
    this.info(message, data);
  }
}

// Export singleton instance
const logger = new Logger();
export default logger;

