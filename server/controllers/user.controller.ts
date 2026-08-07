import { Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import bcryptjs from 'bcryptjs';
import { UserService, toUserResponse } from '../services/user.service';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

// @desc    Update user profile details
// @route   PUT /api/users/profile
export async function updateProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const { firstName, lastName } = req.body;
    const updatedUser = await UserService.updateProfile(req.user.id, { firstName, lastName });

    logger.info(`User Profile: Updated details for ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser,
    });
  } catch (err) {
    next(err);
  }
}

// @desc    Change password
// @route   PUT /api/users/change-password
export async function changePassword(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    const user = await UserService.findById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    // Compare with current password
    let isMatch = false;
    if (typeof user.comparePassword === 'function') {
      isMatch = await user.comparePassword(currentPassword);
    } else {
      isMatch = await bcryptjs.compare(currentPassword, user.passwordHash);
    }

    if (!isMatch) {
      res.status(400).json({
        success: false,
        message: 'The current password you entered is incorrect.',
      });
      return;
    }

    // Hash and save new password
    const salt = await bcryptjs.genSalt(10);
    const newPasswordHash = await bcryptjs.hash(newPassword, salt);

    await UserService.changePassword(req.user.id, newPasswordHash);

    logger.info(`User Profile: Changed password for ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Your password has been changed successfully!',
    });
  } catch (err) {
    next(err);
  }
}

// @desc    Upload or update avatar image
// @route   POST /api/users/avatar
export async function uploadAvatarImage(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded or file was rejected by filter.',
      });
      return;
    }

    const user = await UserService.findById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    // If user already has an avatar on disk, delete it
    if (user.avatar && user.avatar.startsWith('/uploads/avatars/')) {
      const filename = user.avatar.replace('/uploads/avatars/', '');
      const oldPath = path.join('server', 'uploads', 'avatars', filename);
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
          logger.info(`Deleted old avatar file: ${oldPath}`);
        } catch (e) {
          logger.error(`Failed to delete old avatar file: ${oldPath}`, e);
        }
      }
    }

    // Store relative web path of new avatar
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const updatedUser = await UserService.updateAvatar(req.user.id, avatarUrl);

    logger.info(`User Profile: Uploaded avatar image for ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Avatar image uploaded successfully!',
      user: updatedUser,
    });
  } catch (err) {
    next(err);
  }
}

// @desc    Remove avatar image (Revert to default initial)
// @route   DELETE /api/users/avatar
export async function removeAvatarImage(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const user = await UserService.findById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    // Delete file from disk if it exists
    if (user.avatar && user.avatar.startsWith('/uploads/avatars/')) {
      const filename = user.avatar.replace('/uploads/avatars/', '');
      const filePath = path.join('server', 'uploads', 'avatars', filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          logger.info(`Deleted avatar file: ${filePath}`);
        } catch (e) {
          logger.error(`Failed to delete avatar file: ${filePath}`, e);
        }
      }
    }

    const updatedUser = await UserService.updateAvatar(req.user.id, null);

    logger.info(`User Profile: Removed avatar image for ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Avatar image removed successfully.',
      user: updatedUser,
    });
  } catch (err) {
    next(err);
  }
}
