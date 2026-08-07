import { Response, NextFunction } from 'express';
import bcryptjs from 'bcryptjs';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { SettingsService } from '../services/settings.service';
import { UserService } from '../services/user.service';
import { logger } from '../utils/logger';

// Document & Chat Models to fetch stats
import DocumentModelOriginal from '../models/document.model';
import MessageModelOriginal from '../models/message.model';
import { getIsMongoConnected } from '../config/db';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

const DocumentModel = DocumentModelOriginal as any;
const MessageModel = MessageModelOriginal as any;

const LOCAL_DB_PATH = path.join('server', 'uploads', 'local_db.json');

// Helper to calculate statistics
async function getUserStats(userId: string) {
  let documentsUploaded = 0;
  let storageUsed = 0; // in bytes
  let aiRequests = 0;

  if (getIsMongoConnected()) {
    try {
      documentsUploaded = await DocumentModel.countDocuments({ userId });
      const sizeResult = await DocumentModel.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, totalSize: { $sum: '$size' } } }
      ]);
      if (sizeResult.length > 0) {
        storageUsed = sizeResult[0].totalSize || 0;
      }
      aiRequests = await MessageModel.countDocuments({ userId, sender: 'assistant' });
    } catch (e) {
      logger.error('Error fetching MongoDB stats in settings: %O', e);
    }
  } else {
    try {
      if (fs.existsSync(LOCAL_DB_PATH)) {
        const db = JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf-8'));
        const userDocs = (db.documents || []).filter((d: any) => d.userId === userId);
        documentsUploaded = userDocs.length;
        storageUsed = userDocs.reduce((acc: number, d: any) => acc + (d.size || 0), 0);
        
        const userMsgs = (db.messages || []).filter((m: any) => m.userId === userId && m.sender === 'assistant');
        aiRequests = userMsgs.length;
      }
    } catch (e) {
      logger.error('Error fetching local stats in settings: %O', e);
    }
  }

  return {
    documentsUploaded,
    storageUsed,
    aiRequests,
  };
}

// @desc    Get user settings & preferences
// @route   GET /api/settings
export async function getSettings(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const userId = req.user.id;
    const settings = await SettingsService.getSettings(userId);
    const preferences = await SettingsService.getPreferences(userId);

    res.status(200).json({
      success: true,
      settings,
      preferences,
    });
  } catch (err) {
    next(err);
  }
}

// @desc    Update user settings & preferences
// @route   PUT /api/settings
export async function updateSettings(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const userId = req.user.id;
    const { settings: settingsUpdates, preferences: preferencesUpdates } = req.body;

    let settings = null;
    let preferences = null;

    if (settingsUpdates) {
      settings = await SettingsService.updateSettings(userId, settingsUpdates);
    }
    if (preferencesUpdates) {
      preferences = await SettingsService.updatePreferences(userId, preferencesUpdates);
    }

    await SettingsService.addSecurityLog(userId, 'Settings Updated', req);

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully!',
      settings,
      preferences,
    });
  } catch (err) {
    next(err);
  }
}

// @desc    Get profile & account details for settings
// @route   GET /api/settings/profile
export async function getProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const userId = req.user.id;
    const user = await UserService.findById(userId);

    if (!user) {
      res.status(404).json({ success: false, message: 'User account not found.' });
      return;
    }

    const stats = await getUserStats(userId);

    res.status(200).json({
      success: true,
      profile: {
        id: user._id?.toString() || user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        isVerified: user.isVerified,
      },
      stats,
    });
  } catch (err) {
    next(err);
  }
}

// @desc    Update profile details inside settings
// @route   PUT /api/settings/profile
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

    const userId = req.user.id;
    const { firstName, lastName, bio, phoneNumber, username, avatar } = req.body;

    await UserService.updateProfile(userId, { firstName, lastName });
    
    if (avatar !== undefined) {
      await UserService.updateAvatar(userId, avatar);
    }
    
    const extraUpdates: any = {};
    if (bio !== undefined) extraUpdates.bio = bio;
    if (username !== undefined) extraUpdates.username = username;
    if (phoneNumber !== undefined) extraUpdates.phoneNumber = phoneNumber;
    
    if (Object.keys(extraUpdates).length > 0) {
      await SettingsService.updateSettings(userId, extraUpdates);
    }

    await SettingsService.addSecurityLog(userId, 'Profile Updated', req);

    res.status(200).json({
      success: true,
      message: 'Profile details updated successfully!',
    });
  } catch (err) {
    next(err);
  }
}

// @desc    Change user password
// @route   PUT /api/settings/password
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

    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await UserService.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    let isMatch = false;
    if (typeof user.comparePassword === 'function') {
      isMatch = await user.comparePassword(currentPassword);
    } else {
      isMatch = await bcryptjs.compare(currentPassword, user.passwordHash);
    }

    if (!isMatch) {
      res.status(400).json({ success: false, message: 'The current password you entered is incorrect.' });
      return;
    }

    const salt = await bcryptjs.genSalt(10);
    const newPasswordHash = await bcryptjs.hash(newPassword, salt);

    await UserService.changePassword(userId, newPasswordHash);
    await SettingsService.addSecurityLog(userId, 'Password Changed', req);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully!',
    });
  } catch (err) {
    next(err);
  }
}

// @desc    Get user active sessions
// @route   GET /api/settings/sessions
export async function getSessions(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const userId = req.user.id;
    const sessions = await SettingsService.getSessions(userId);
    const securityLogs = await SettingsService.getSecurityLogs(userId);

    res.status(200).json({
      success: true,
      sessions,
      securityLogs,
    });
  } catch (err) {
    next(err);
  }
}

// @desc    Delete a specific session
// @route   DELETE /api/settings/sessions/:id
export async function deleteSession(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const userId = req.user.id;
    const sessionId = req.params.id;

    const deleted = await SettingsService.deleteSession(userId, sessionId);
    await SettingsService.addSecurityLog(userId, `Revoked session ${sessionId}`, req);

    res.status(200).json({
      success: true,
      message: deleted ? 'Session revoked successfully.' : 'Session not found or already deleted.',
    });
  } catch (err) {
    next(err);
  }
}

// @desc    Delete all other sessions
// @route   DELETE /api/settings/sessions
export async function deleteSessions(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const userId = req.user.id;
    const { keepCurrent, currentSessionId } = req.body;

    await SettingsService.deleteAllSessions(userId, keepCurrent ? currentSessionId : undefined);
    await SettingsService.addSecurityLog(userId, 'Revoked all other active sessions', req);

    res.status(200).json({
      success: true,
      message: 'All other active sessions have been successfully revoked.',
    });
  } catch (err) {
    next(err);
  }
}

// @desc    Export user data
// @route   POST /api/settings/export
export async function exportSettings(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const userId = req.user.id;
    const format = req.body.format || 'json';

    const exportedData = await SettingsService.exportUserData(userId);
    await SettingsService.addSecurityLog(userId, `Exported account data in ${format.toUpperCase()}`, req);

    if (format === 'csv') {
      let csv = 'SECTION,KEY,VALUE\n';
      csv += `Profile,First Name,${exportedData.profile.firstName}\n`;
      csv += `Profile,Last Name,${exportedData.profile.lastName}\n`;
      csv += `Profile,Email,${exportedData.profile.email}\n`;
      csv += `Profile,Created At,${exportedData.profile.createdAt}\n`;

      Object.entries(exportedData.settings).forEach(([k, v]) => {
        csv += `AI & Privacy,${k},${v}\n`;
      });
      Object.entries(exportedData.preferences).forEach(([k, v]) => {
        csv += `Appearance & Notifications,${k},${v}\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=knowledge_base_export_${userId}.csv`);
      res.status(200).send(csv);
      return;
    }

    res.status(200).json({
      success: true,
      data: exportedData,
    });
  } catch (err) {
    next(err);
  }
}

// @desc    Import setting preferences
// @route   POST /api/settings/import
export async function importSettings(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const userId = req.user.id;
    const { settings, preferences } = req.body;

    await SettingsService.importUserData(userId, { settings, preferences });
    await SettingsService.addSecurityLog(userId, 'Imported backup settings configuration', req);

    res.status(200).json({
      success: true,
      message: 'Backup configurations imported successfully!',
    });
  } catch (err) {
    next(err);
  }
}

// @desc    Delete all chats
// @route   DELETE /api/settings/chats
export async function deleteChats(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const userId = req.user.id;
    await SettingsService.clearAllChats(userId);
    await SettingsService.addSecurityLog(userId, 'Deleted all chat conversations', req);

    res.status(200).json({
      success: true,
      message: 'All conversations and chat message logs have been wiped successfully.',
    });
  } catch (err) {
    next(err);
  }
}

// @desc    Delete all documents
// @route   DELETE /api/settings/documents
export async function deleteDocuments(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const userId = req.user.id;
    await SettingsService.clearAllDocuments(userId);
    await SettingsService.addSecurityLog(userId, 'Deleted all document library assets', req);

    res.status(200).json({
      success: true,
      message: 'All documents, text chunks, and vector embeddings have been wiped successfully.',
    });
  } catch (err) {
    next(err);
  }
}

// @desc    Wipe user account and delete completely
// @route   DELETE /api/settings/account
export async function deleteAccount(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const userId = req.user.id;
    const { passwordConfirm } = req.body;

    const user = await UserService.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'Account not found.' });
      return;
    }

    let isMatch = false;
    if (typeof user.comparePassword === 'function') {
      isMatch = await user.comparePassword(passwordConfirm);
    } else {
      isMatch = await bcryptjs.compare(passwordConfirm, user.passwordHash);
    }

    if (!isMatch) {
      res.status(400).json({ success: false, message: 'The confirmation password you entered is incorrect.' });
      return;
    }

    await SettingsService.deleteAccount(userId);
    logger.info(`Settings Module: Completely deleted user account: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Your personal knowledge assistant account and all associated data have been permanently deleted.',
    });
  } catch (err) {
    next(err);
  }
}
