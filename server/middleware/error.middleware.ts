import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function notFound(req: Request, res: Response, next: NextFunction): void {
  res.status(404).json({
    success: false,
    message: `Resource not found - ${req.originalUrl}`,
  });
}

export function globalErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error('API Error: %O', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred.';

  // Handling Multer file size / type limits
  if (err.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({
      success: false,
      message: 'File is too large. Maximum allowed size is 5MB.',
    });
    return;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || undefined,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
}
