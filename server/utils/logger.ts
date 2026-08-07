import winston from 'winston';
import path from 'path';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    return `[${timestamp}] ${level}: ${message}${stack ? `\n${stack}` : ''}`;
  })
);

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
    new winston.transports.File({
      filename: path.join('server', 'logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join('server', 'logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Dedicated Access Logger for HTTP Request Logs
export const accessLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new winston.transports.File({
      filename: path.join('server', 'logs', 'access.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
  ],
});

// Dedicated AI Logger for Embedding and Prompt completions
export const aiLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new winston.transports.File({
      filename: path.join('server', 'logs', 'ai.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});
