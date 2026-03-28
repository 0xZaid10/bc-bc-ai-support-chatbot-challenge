import { Request, Response, NextFunction } from 'express';

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

const currentLogLevel: LogLevel =
  (process.env.LOG_LEVEL?.toUpperCase() as LogLevel) in LOG_LEVELS
    ? (process.env.LOG_LEVEL!.toUpperCase() as LogLevel)
    : 'INFO';

function formatMessage(level: LogLevel, message: string, meta?: unknown): string {
  const timestamp = new Date().toISOString();
  const metaStr = meta !== undefined ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}] ${message}${metaStr}`;
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLogLevel];
}

function debug(message: string, meta?: unknown): void {
  if (shouldLog('DEBUG')) {
    console.debug(formatMessage('DEBUG', message, meta));
  }
}

function info(message: string, meta?: unknown): void {
  if (shouldLog('INFO')) {
    console.info(formatMessage('INFO', message, meta));
  }
}

function warn(message: string, meta?: unknown): void {
  if (shouldLog('WARN')) {
    console.warn(formatMessage('WARN', message, meta));
  }
}

function error(message: string, meta?: unknown): void {
  if (shouldLog('ERROR')) {
    console.error(formatMessage('ERROR', message, meta));
  }
}

function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const { method, url, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const level: LogLevel = statusCode >= 500 ? 'ERROR' : statusCode >= 400 ? 'WARN' : 'INFO';
    const message = `${method} ${url} ${statusCode} ${duration}ms`;
    const meta = { ip, statusCode, duration };

    if (level === 'ERROR') {
      error(message, meta);
    } else if (level === 'WARN') {
      warn(message, meta);
    } else {
      info(message, meta);
    }
  });

  next();
}

const logger = {
  debug,
  info,
  warn,
  error,
  requestLogger,
};

export default logger;