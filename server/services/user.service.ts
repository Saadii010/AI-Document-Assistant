import fs from 'fs';
import path from 'path';
import bcryptjs from 'bcryptjs';
import { UserModel as UserModelOriginal, IUser } from '../models/user.model';
import { getIsMongoConnected } from '../config/db';
import { logger } from '../utils/logger';

const UserModel = UserModelOriginal as any;

// Interface for User details
export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin';
  avatar: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
}

// Local Database Interface for when MongoDB is not connected
interface LocalUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  avatar: string | null;
  isVerified: boolean;
  isActive: boolean;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: string | null;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
}

const LOCAL_DB_PATH = path.join('server', 'uploads', 'local_db.json');

// Ensure parent directory exists for local database
function ensureLocalDbExists() {
  const dir = path.dirname(LOCAL_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify({ users: [] }, null, 2));
  }
}

// Read local database
function readLocalDb(): { users: LocalUser[] } {
  ensureLocalDbExists();
  try {
    const data = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    logger.error('Error reading local database: %O', err);
    return { users: [] };
  }
}

// Write local database
function writeLocalDb(data: { users: LocalUser[] }) {
  ensureLocalDbExists();
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    logger.error('Error writing to local database: %O', err);
  }
}

// Map MongoDB user or local user to client-safe response
function toUserResponse(user: any): UserResponse {
  return {
    id: user._id?.toString() || user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    isVerified: user.isVerified,
    isActive: user.isActive,
    createdAt: user.createdAt?.toString(),
    updatedAt: user.updatedAt?.toString(),
    lastLogin: user.lastLogin?.toString() || null,
  };
}

export class UserService {
  // Check if we use MongoDB or local DB fallback
  static useMongo(): boolean {
    return getIsMongoConnected();
  }

  // Register a new user
  static async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    role?: 'user' | 'admin';
  }): Promise<UserResponse> {
    const emailLower = userData.email.toLowerCase().trim();

    if (this.useMongo()) {
      const existing = await UserModel.findOne({ email: emailLower });
      if (existing) {
        throw new Error('An account with this email already exists.');
      }

      const user = new UserModel({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: emailLower,
        passwordHash: userData.passwordHash,
        role: userData.role || 'user',
        isVerified: true, // Auto-verify in Phase 1 for friction-free setup
        isActive: true,
      });

      await user.save();
      logger.info(`User registered successfully via MongoDB: ${emailLower}`);
      return toUserResponse(user);
    } else {
      const db = readLocalDb();
      const existing = db.users.find((u) => u.email === emailLower);
      if (existing) {
        throw new Error('An account with this email already exists.');
      }

      const now = new Date().toISOString();
      const newUser: LocalUser = {
        id: Math.random().toString(36).substring(2, 15),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: emailLower,
        passwordHash: userData.passwordHash,
        role: userData.role || 'user',
        avatar: null,
        isVerified: true,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        lastLogin: null,
      };

      db.users.push(newUser);
      writeLocalDb(db);
      logger.info(`User registered successfully via Local DB fallback: ${emailLower}`);
      return toUserResponse(newUser);
    }
  }

  // Find user by email
  static async findByEmail(email: string): Promise<any | null> {
    const emailLower = email.toLowerCase().trim();
    if (this.useMongo()) {
      return await UserModel.findOne({ email: emailLower });
    } else {
      const db = readLocalDb();
      const user = db.users.find((u) => u.email === emailLower);
      return user || null;
    }
  }

  // Find user by ID
  static async findById(id: string): Promise<any | null> {
    if (this.useMongo()) {
      return await UserModel.findById(id);
    } else {
      const db = readLocalDb();
      const user = db.users.find((u) => u.id === id);
      return user || null;
    }
  }

  // Update user profile
  static async updateProfile(
    id: string,
    updates: { firstName: string; lastName: string }
  ): Promise<UserResponse> {
    if (this.useMongo()) {
      const user = await UserModel.findById(id);
      if (!user) throw new Error('User not found.');

      user.firstName = updates.firstName;
      user.lastName = updates.lastName;
      await user.save();

      return toUserResponse(user);
    } else {
      const db = readLocalDb();
      const userIndex = db.users.findIndex((u) => u.id === id);
      if (userIndex === -1) throw new Error('User not found.');

      db.users[userIndex].firstName = updates.firstName;
      db.users[userIndex].lastName = updates.lastName;
      db.users[userIndex].updatedAt = new Date().toISOString();

      writeLocalDb(db);
      return toUserResponse(db.users[userIndex]);
    }
  }

  // Update last login
  static async updateLastLogin(id: string): Promise<void> {
    const now = new Date();
    if (this.useMongo()) {
      await UserModel.findByIdAndUpdate(id, { lastLogin: now });
    } else {
      const db = readLocalDb();
      const userIndex = db.users.findIndex((u) => u.id === id);
      if (userIndex !== -1) {
        db.users[userIndex].lastLogin = now.toISOString();
        writeLocalDb(db);
      }
    }
  }

  // Change password
  static async changePassword(id: string, passwordHash: string): Promise<void> {
    if (this.useMongo()) {
      const user = await UserModel.findById(id);
      if (!user) throw new Error('User not found.');
      user.passwordHash = passwordHash;
      await user.save();
    } else {
      const db = readLocalDb();
      const userIndex = db.users.findIndex((u) => u.id === id);
      if (userIndex === -1) throw new Error('User not found.');
      db.users[userIndex].passwordHash = passwordHash;
      db.users[userIndex].updatedAt = new Date().toISOString();
      writeLocalDb(db);
    }
  }

  // Set reset password token
  static async setResetToken(
    email: string,
    token: string,
    expires: Date
  ): Promise<void> {
    const emailLower = email.toLowerCase().trim();
    if (this.useMongo()) {
      const user = await UserModel.findOne({ email: emailLower });
      if (!user) throw new Error('No user registered with this email.');
      user.resetPasswordToken = token;
      user.resetPasswordExpires = expires;
      await user.save();
    } else {
      const db = readLocalDb();
      const userIndex = db.users.findIndex((u) => u.email === emailLower);
      if (userIndex === -1) throw new Error('No user registered with this email.');
      db.users[userIndex].resetPasswordToken = token;
      db.users[userIndex].resetPasswordExpires = expires.toISOString();
      writeLocalDb(db);
    }
  }

  // Reset password by token
  static async resetPasswordByToken(token: string, passwordHash: string): Promise<void> {
    if (this.useMongo()) {
      const user = await UserModel.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      });
      if (!user) throw new Error('Password reset token is invalid or has expired.');

      user.passwordHash = passwordHash;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
    } else {
      const db = readLocalDb();
      const now = new Date();
      const userIndex = db.users.findIndex(
        (u) =>
          u.resetPasswordToken === token &&
          u.resetPasswordExpires &&
          new Date(u.resetPasswordExpires) > now
      );
      if (userIndex === -1) {
        throw new Error('Password reset token is invalid or has expired.');
      }

      db.users[userIndex].passwordHash = passwordHash;
      db.users[userIndex].resetPasswordToken = null;
      db.users[userIndex].resetPasswordExpires = null;
      db.users[userIndex].updatedAt = now.toISOString();
      writeLocalDb(db);
    }
  }

  // Update user avatar
  static async updateAvatar(id: string, avatarUrl: string | null): Promise<UserResponse> {
    if (this.useMongo()) {
      const user = await UserModel.findById(id);
      if (!user) throw new Error('User not found.');
      user.avatar = avatarUrl;
      await user.save();
      return toUserResponse(user);
    } else {
      const db = readLocalDb();
      const userIndex = db.users.findIndex((u) => u.id === id);
      if (userIndex === -1) throw new Error('User not found.');
      db.users[userIndex].avatar = avatarUrl;
      db.users[userIndex].updatedAt = new Date().toISOString();
      writeLocalDb(db);
      return toUserResponse(db.users[userIndex]);
    }
  }
}
export { toUserResponse };
