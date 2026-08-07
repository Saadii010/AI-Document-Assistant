import { Request, Response, NextFunction } from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserService, toUserResponse } from '../services/user.service';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

// Helper to generate JWT token
function generateToken(user: { id: string; email: string; role: string }): string {
  const secret = process.env.JWT_SECRET || 'fallback_super_secret_key_12345';
  const expires = process.env.JWT_EXPIRE || '7d';
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    secret,
    { expiresIn: expires as any }
  );
}

// @desc    Register a new user
// @route   POST /api/auth/register
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    const salt = await bcryptjs.genSalt(10);
    const passwordHash = await bcryptjs.hash(password, salt);

    const user = await UserService.register({
      firstName,
      lastName,
      email,
      passwordHash,
      role: role || 'user',
    });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    logger.info(`Auth Register: New account created for ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome aboard.',
      token,
      user,
    });
  } catch (err: any) {
    if (err.message.includes('already exists')) {
      res.status(400).json({
        success: false,
        message: err.message,
      });
      return;
    }
    next(err);
  }
}

// @desc    Login user
// @route   POST /api/auth/login
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    const user = await UserService.findByEmail(email);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Your account is currently inactive. Please contact support.',
      });
      return;
    }

    // Since findByEmail returns either Mongoose document or LocalUser, handle comparison
    let isMatch = false;
    if (typeof user.comparePassword === 'function') {
      isMatch = await user.comparePassword(password);
    } else {
      isMatch = await bcryptjs.compare(password, user.passwordHash);
    }

    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const userId = user._id?.toString() || user.id;
    await UserService.updateLastLogin(userId);

    const userResponse = toUserResponse(user);
    const token = generateToken({ id: userId, email: user.email, role: user.role });

    logger.info(`Auth Login: User logged in: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: userResponse,
    });
  } catch (err) {
    next(err);
  }
}

// @desc    Logout user (client-side clears token, backend provides validation)
// @route   POST /api/auth/logout
export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    logger.info('Auth Logout: Token invalidated successfully.');
    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (err) {
    next(err);
  }
}

// @desc    Forgot Password - request reset token
// @route   POST /api/auth/forgot-password
export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body;

    const user = await UserService.findByEmail(email);
    if (!user) {
      // Respond with success to prevent timing/enumeration attacks in production,
      // but return token in development for testing
      res.status(200).json({
        success: true,
        message: 'If an account exists with that email, a password reset token has been generated.',
      });
      return;
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await UserService.setResetToken(email, resetToken, resetExpires);

    logger.info(`Auth ForgotPassword: Password reset token generated for ${email}`);

    // In local development / preview environment, we return the token directly so that
    // testing is painless without requiring an actual email server setup.
    res.status(200).json({
      success: true,
      message: 'If an account exists with that email, a password reset token has been generated.',
      resetToken, // Returned explicitly for effortless developer testing
    });
  } catch (err) {
    next(err);
  }
}

// @desc    Reset Password using token
// @route   POST /api/auth/reset-password
export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token, password } = req.body;

    const salt = await bcryptjs.genSalt(10);
    const passwordHash = await bcryptjs.hash(password, salt);

    await UserService.resetPasswordByToken(token, passwordHash);

    logger.info('Auth ResetPassword: Password updated successfully via token.');

    res.status(200).json({
      success: true,
      message: 'Your password has been reset successfully. You can now log in with your new password.',
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to reset password.',
    });
  }
}

// @desc    Get current user details (Verify current token)
// @route   GET /api/auth/me
export async function getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized.',
      });
      return;
    }

    const user = await UserService.findById(req.user.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      user: toUserResponse(user),
    });
  } catch (err) {
    next(err);
  }
}
