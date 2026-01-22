import pino from "pino";
const baseLogger = pino({
  level: process.env.LOG_LEVEL || "info",
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,

  redact: {
    paths: [
      "token",
      "password",
      "secret",
      "apiKey",
      "webhookUrl",
      "*.token",
      "*.password",
      "*.secret",
      "*.apiKey",
      "*.webhookUrl",
    ],
    remove: true,
  },
});

export interface LogContext {
  requestId?: string;
  jobId?: string;
  versionId?: string;
  chunkId?: string;
  userId?: string;
  [key: string]: unknown;
}

export function generateRequestId(): string {
  return crypto.randomUUID();
}


function createChildLogger(context: LogContext = {}) {
  return baseLogger.child(context);
}

export const logger = {

  info: (message: string, context?: LogContext) => {
    const child = createChildLogger(context);
    child.info(message);
  },


  warn: (message: string, context?: LogContext) => {
    const child = createChildLogger(context);
    child.warn(message);
  },

  error: (message: string, error?: Error | unknown, context?: LogContext) => {
    const child = createChildLogger(context);
    const errorContext = {
      ...context,
      ...(error instanceof Error
        ? {
          errorMessage: error.message,
          errorStack: error.stack,
          errorName: error.name,
        }
        : error
          ? { error: String(error) }
          : {}),
    };
    child.error(errorContext, message);
  },
};
