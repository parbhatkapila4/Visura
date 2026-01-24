
export interface ClientLogContext {
  [key: string]: unknown;
}

class ClientLogger {
  private isDevelopment = process.env.NODE_ENV === "development";

  private formatMessage(level: string, message: string, context?: ClientLogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  info(message: string, context?: ClientLogContext): void {
    if (this.isDevelopment) {
      console.log(this.formatMessage("info", message, context));
    }
  }

  warn(message: string, context?: ClientLogContext): void {
    if (this.isDevelopment) {
      console.warn(this.formatMessage("warn", message, context));
    }
  }

  error(message: string, error?: Error | unknown, context?: ClientLogContext): void {
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

    if (this.isDevelopment) {
      console.error(this.formatMessage("error", message, errorContext));
    }
  }
}

export const clientLogger = new ClientLogger();
