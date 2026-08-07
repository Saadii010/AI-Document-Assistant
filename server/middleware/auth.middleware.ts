import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserService } from '../services/user.service';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'user' | 'admin';
  };
}

export async function protect(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Access denied. No authorization token was provided.',
    });
    return;
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'fallback_super_secret_key_12345';
    const decoded = jwt.verify(token, jwtSecret) as { id: string; email: string; role: 'user' | 'admin' };

    // Fetch user to ensure user still exists and is active
    const user = await UserService.findById(decoded.id);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
      return;
    }

    req.user = {
      id: user._id?.toString() || user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err: any) {
    logger.error('JWT Token Verification Error: %O', err);

    if (err.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.',
        code: 'TOKEN_EXPIRED',
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: 'Invalid authorization token.',
    });
  }
}

export function authorize(...roles: Array<'user' | 'admin'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to access this resource.',
      });
      return;
    }
    next();
  };
}
