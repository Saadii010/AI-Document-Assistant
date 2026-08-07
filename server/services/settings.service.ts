import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { getIsMongoConnected } from '../config/db';
import { logger } from '../utils/logger';

// Import Models
import { UserSettingsModel as UserSettingsModelOriginal } from '../models/userSettings.model';
import { UserPreferencesModel as UserPreferencesModelOriginal } from '../models/userPreferences.model';
import { UserSessionModel as UserSessionModelOriginal } from '../models/userSessions.model';
import { SecurityLogModel as SecurityLogModelOriginal } from '../models/securityLogs.model';
import { UserModel as UserModelOriginal } from '../models/user.model';

// Other models for cascade deletions
import ChatModelOriginal from '../models/chat.model';
import ConversationModelOriginal from '../models/conversation.model';
import MessageModelOriginal from '../models/message.model';
import DocumentModelOriginal from '../models/document.model';
import ChunkModelOriginal from '../models/chunk.model';
import EmbeddingModelOriginal from '../models/embedding.model';
import AnnotationModelOriginal from '../models/annotation.model';
import BookmarkModelOriginal from '../models/bookmark.model';
import ReadingHistoryModelOriginal from '../models/readingHistory.model';
import SearchHistoryModelOriginal from '../models/searchHistory.model';
import SavedSearchesModelOriginal from '../models/savedSearches.model';
import ActivityModelOriginal from '../models/activity.model';
import NotificationModelOriginal from '../models/notification.model';

// Cast all models to any to avoid typescript generic overload errors
const UserSettingsModel = UserSettingsModelOriginal as any;
const UserPreferencesModel = UserPreferencesModelOriginal as any;
const UserSessionModel = UserSessionModelOriginal as any;
const SecurityLogModel = SecurityLogModelOriginal as any;
const UserModel = UserModelOriginal as any;

const ChatModel = ChatModelOriginal as any;
const ConversationModel = ConversationModelOriginal as any;
const MessageModel = MessageModelOriginal as any;
const DocumentModel = DocumentModelOriginal as any;
const ChunkModel = ChunkModelOriginal as any;
const EmbeddingModel = EmbeddingModelOriginal as any;
const AnnotationModel = AnnotationModelOriginal as any;
const BookmarkModel = BookmarkModelOriginal as any;
const ReadingHistoryModel = ReadingHistoryModelOriginal as any;
const SearchHistoryModel = SearchHistoryModelOriginal as any;
const SavedSearchesModel = SavedSearchesModelOriginal as any;
const ActivityModel = ActivityModelOriginal as any;
const NotificationModel = NotificationModelOriginal as any;

const LOCAL_DB_PATH = path.join('server', 'uploads', 'local_db.json');

// Interfaces for local DB structure
interface LocalSettings {
  userId: string;
  preferredModel: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  streaming: boolean;
  defaultDocSelection: string;
  autoSaveConversations: boolean;
  citationDisplay: boolean;
  responseLanguage: string;
  profileVisibility: string;
  searchVisibility: boolean;
  dataCollection: boolean;
  analytics: boolean;
  conversationHistory: boolean;
  personalization: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LocalPreferences {
  userId: string;
  theme: string;
  fontSize: string;
  compactMode: boolean;
  animationToggle: boolean;
  accentColor: string;
  emailNotifications: boolean;
  browserNotifications: boolean;
  uploadNotifications: boolean;
  aiCompletionNotifications: boolean;
  securityAlerts: boolean;
  systemUpdates: boolean;
  newsletter: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LocalSession {
  id: string;
  userId: string;
  browser: string;
  os: string;
  ipAddress: string;
  country: string;
  loginTime: string;
  currentDevice: boolean;
  userAgent: string;
}

interface LocalSecurityLog {
  id: string;
  userId: string;
  action: string;
  ipAddress: string;
  browser: string;
  os: string;
  country: string;
  timestamp: string;
}

function ensureLocalDbFields() {
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    fs.writeFileSync(
      LOCAL_DB_PATH,
      JSON.stringify(
        {
          users: [],
          settings: [],
          preferences: [],
          sessions: [],
          securityLogs: [],
          documents: [],
          chats: [],
          conversations: [],
          messages: [],
          chunks: [],
          embeddings: []
        },
        null,
        2
      )
    );
  }
  try {
    const raw = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
    const db = JSON.parse(raw);
    let modified = false;
    const required = ['settings', 'preferences', 'sessions', 'securityLogs'];
    required.forEach((f) => {
      if (!db[f]) {
        db[f] = [];
        modified = true;
      }
    });
    if (modified) {
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(db, null, 2));
    }
  } catch (err) {
    logger.error('Error ensuring local DB fields: %O', err);
  }
}

function readLocalDb(): any {
  ensureLocalDbFields();
  try {
    return JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf-8'));
  } catch (err) {
    return { users: [], settings: [], preferences: [], sessions: [], securityLogs: [] };
  }
}

function writeLocalDb(data: any) {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    logger.error('Error writing local DB: %O', err);
  }
}

export class SettingsService {
  static useMongo(): boolean {
    return getIsMongoConnected();
  }

  // --- SETTINGS (AI Preferences & Privacy) ---
  static async getSettings(userId: string): Promise<any> {
    if (this.useMongo()) {
      let settings = await UserSettingsModel.findOne({ userId });
      if (!settings) {
        settings = await UserSettingsModel.create({ userId });
      }
      return settings;
    } else {
      const db = readLocalDb();
      let settings = db.settings.find((s: any) => s.userId === userId);
      if (!settings) {
        const now = new Date().toISOString();
        settings = {
          userId,
          preferredModel: 'Gemini 1.5 Flash',
          temperature: 0.7,
          maxTokens: 2048,
          topP: 0.95,
          streaming: true,
          defaultDocSelection: 'all',
          autoSaveConversations: true,
          citationDisplay: true,
          responseLanguage: 'en',
          profileVisibility: 'private',
          searchVisibility: true,
          dataCollection: true,
          analytics: true,
          conversationHistory: true,
          personalization: true,
          createdAt: now,
          updatedAt: now,
        };
        db.settings.push(settings);
        writeLocalDb(db);
      }
      return settings;
    }
  }

  static async updateSettings(userId: string, updates: any): Promise<any> {
    // Validate updates
    const allowed = [
      'preferredModel',
      'temperature',
      'maxTokens',
      'topP',
      'streaming',
      'defaultDocSelection',
      'autoSaveConversations',
      'citationDisplay',
      'responseLanguage',
      'profileVisibility',
      'searchVisibility',
      'dataCollection',
      'analytics',
      'conversationHistory',
      'personalization',
    ];

    const filtered: any = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        filtered[key] = updates[key];
      }
    }

    if (this.useMongo()) {
      const settings = await UserSettingsModel.findOneAndUpdate(
        { userId },
        { $set: filtered },
        { new: true, upsert: true }
      );
      return settings;
    } else {
      const db = readLocalDb();
      let idx = db.settings.findIndex((s: any) => s.userId === userId);
      if (idx === -1) {
        await this.getSettings(userId);
        db.settings = readLocalDb().settings;
        idx = db.settings.findIndex((s: any) => s.userId === userId);
      }
      db.settings[idx] = {
        ...db.settings[idx],
        ...filtered,
        updatedAt: new Date().toISOString(),
      };
      writeLocalDb(db);
      return db.settings[idx];
    }
  }

  // --- PREFERENCES (Appearance & Notifications) ---
  static async getPreferences(userId: string): Promise<any> {
    if (this.useMongo()) {
      let prefs = await UserPreferencesModel.findOne({ userId });
      if (!prefs) {
        prefs = await UserPreferencesModel.create({ userId });
      }
      return prefs;
    } else {
      const db = readLocalDb();
      let prefs = db.preferences.find((p: any) => p.userId === userId);
      if (!prefs) {
        const now = new Date().toISOString();
        prefs = {
          userId,
          theme: 'system',
          fontSize: 'base',
          compactMode: false,
          animationToggle: true,
          accentColor: 'indigo',
          emailNotifications: true,
          browserNotifications: true,
          uploadNotifications: true,
          aiCompletionNotifications: true,
          securityAlerts: true,
          systemUpdates: true,
          newsletter: false,
          createdAt: now,
          updatedAt: now,
        };
        db.preferences.push(prefs);
        writeLocalDb(db);
      }
      return prefs;
    }
  }

  static async updatePreferences(userId: string, updates: any): Promise<any> {
    const allowed = [
      'theme',
      'fontSize',
      'compactMode',
      'animationToggle',
      'accentColor',
      'emailNotifications',
      'browserNotifications',
      'uploadNotifications',
      'aiCompletionNotifications',
      'securityAlerts',
      'systemUpdates',
      'newsletter',
    ];

    const filtered: any = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        filtered[key] = updates[key];
      }
    }

    if (this.useMongo()) {
      const prefs = await UserPreferencesModel.findOneAndUpdate(
        { userId },
        { $set: filtered },
        { new: true, upsert: true }
      );
      return prefs;
    } else {
      const db = readLocalDb();
      let idx = db.preferences.findIndex((p: any) => p.userId === userId);
      if (idx === -1) {
        await this.getPreferences(userId);
        db.preferences = readLocalDb().preferences;
        idx = db.preferences.findIndex((p: any) => p.userId === userId);
      }
      db.preferences[idx] = {
        ...db.preferences[idx],
        ...filtered,
        updatedAt: new Date().toISOString(),
      };
      writeLocalDb(db);
      return db.preferences[idx];
    }
  }

  // --- SESSIONS ---
  static async getSessions(userId: string): Promise<any[]> {
    if (this.useMongo()) {
      return await UserSessionModel.find({ userId }).sort({ loginTime: -1 });
    } else {
      const db = readLocalDb();
      return db.sessions.filter((s: any) => s.userId === userId);
    }
  }

  static async createSession(userId: string, sessionData: {
    browser: string;
    os: string;
    ipAddress: string;
    country: string;
    userAgent: string;
    currentDevice?: boolean;
  }): Promise<any> {
    if (this.useMongo()) {
      // If setting this device as current, unmark others for safety
      if (sessionData.currentDevice) {
        await UserSessionModel.updateMany({ userId }, { currentDevice: false });
      }
      return await UserSessionModel.create({
        userId,
        ...sessionData,
        loginTime: new Date(),
      });
    } else {
      const db = readLocalDb();
      if (sessionData.currentDevice) {
        db.sessions.forEach((s: any) => {
          if (s.userId === userId) s.currentDevice = false;
        });
      }
      const newSess: LocalSession = {
        id: Math.random().toString(36).substring(2, 15),
        userId,
        browser: sessionData.browser,
        os: sessionData.os,
        ipAddress: sessionData.ipAddress,
        country: sessionData.country,
        userAgent: sessionData.userAgent,
        loginTime: new Date().toISOString(),
        currentDevice: !!sessionData.currentDevice,
      };
      db.sessions.push(newSess);
      writeLocalDb(db);
      return newSess;
    }
  }

  static async deleteSession(userId: string, sessionId: string): Promise<boolean> {
    if (this.useMongo()) {
      const res = await UserSessionModel.deleteOne({ _id: sessionId, userId });
      return res.deletedCount > 0;
    } else {
      const db = readLocalDb();
      const initialLen = db.sessions.length;
      db.sessions = db.sessions.filter((s: any) => !(s.id === sessionId && s.userId === userId));
      writeLocalDb(db);
      return db.sessions.length < initialLen;
    }
  }

  static async deleteAllSessions(userId: string, currentSessionId?: string): Promise<void> {
    if (this.useMongo()) {
      const filter: any = { userId };
      if (currentSessionId) {
        filter._id = { $ne: currentSessionId };
      }
      await UserSessionModel.deleteMany(filter);
    } else {
      const db = readLocalDb();
      db.sessions = db.sessions.filter((s: any) => {
        if (s.userId !== userId) return true;
        if (currentSessionId && s.id === currentSessionId) return true;
        return false;
      });
      writeLocalDb(db);
    }
  }

  // --- SECURITY LOGS ---
  static async getSecurityLogs(userId: string): Promise<any[]> {
    if (this.useMongo()) {
      return await SecurityLogModel.find({ userId }).sort({ timestamp: -1 }).limit(100);
    } else {
      const db = readLocalDb();
      return db.securityLogs
        .filter((l: any) => l.userId === userId)
        .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 100);
    }
  }

  static async addSecurityLog(userId: string, action: string, req: any): Promise<void> {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    
    // Parse user agent roughly
    const userAgent = req.headers['user-agent'] || '';
    let browser = 'Unknown Browser';
    let os = 'Unknown OS';

    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Macintosh') || userAgent.includes('Mac OS')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';
    else if (userAgent.includes('Android')) os = 'Android';

    const country = 'Localhost'; // Since we are in local development / sandboxed

    if (this.useMongo()) {
      await SecurityLogModel.create({
        userId,
        action,
        ipAddress,
        browser,
        os,
        country,
        timestamp: new Date(),
      });
    } else {
      const db = readLocalDb();
      const newLog: LocalSecurityLog = {
        id: Math.random().toString(36).substring(2, 15),
        userId,
        action,
        ipAddress,
        browser,
        os,
        country,
        timestamp: new Date().toISOString(),
      };
      db.securityLogs.push(newLog);
      writeLocalDb(db);
    }
  }

  // --- ACTIONS ---
  static async clearAllChats(userId: string): Promise<void> {
    if (this.useMongo()) {
      // Delete from models
      await ChatModel.deleteMany({ userId });
      await ConversationModel.deleteMany({ userId });
      await MessageModel.deleteMany({ userId });
    } else {
      const db = readLocalDb();
      if (db.chats) db.chats = db.chats.filter((c: any) => c.userId !== userId);
      if (db.conversations) db.conversations = db.conversations.filter((c: any) => c.userId !== userId);
      if (db.messages) db.messages = db.messages.filter((m: any) => m.userId !== userId);
      writeLocalDb(db);
    }
  }

  static async clearAllDocuments(userId: string): Promise<void> {
    if (this.useMongo()) {
      await DocumentModel.deleteMany({ userId });
      await ChunkModel.deleteMany({ userId });
      await EmbeddingModel.deleteMany({ userId });
      if (AnnotationModel) await AnnotationModel.deleteMany({ userId });
      if (BookmarkModel) await BookmarkModel.deleteMany({ userId });
      if (ReadingHistoryModel) await ReadingHistoryModel.deleteMany({ userId });
    } else {
      const db = readLocalDb();
      if (db.documents) db.documents = db.documents.filter((d: any) => d.userId !== userId);
      if (db.chunks) db.chunks = db.chunks.filter((c: any) => c.userId !== userId);
      if (db.embeddings) db.embeddings = db.embeddings.filter((e: any) => e.userId !== userId);
      writeLocalDb(db);
    }
  }

  static async deleteAccount(userId: string): Promise<void> {
    // Clear chats and documents first
    await this.clearAllChats(userId);
    await this.clearAllDocuments(userId);

    if (this.useMongo()) {
      // Clear settings, preferences, sessions, security logs
      await UserSettingsModel.deleteMany({ userId });
      await UserPreferencesModel.deleteMany({ userId });
      await UserSessionModel.deleteMany({ userId });
      await SecurityLogModel.deleteMany({ userId });
      if (SavedSearchesModel) await SavedSearchesModel.deleteMany({ userId });
      if (SearchHistoryModel) await SearchHistoryModel.deleteMany({ userId });
      if (ActivityModel) await ActivityModel.deleteMany({ userId });
      if (NotificationModel) await NotificationModel.deleteMany({ userId });
      
      // Delete user
      await UserModel.deleteOne({ _id: userId });
    } else {
      const db = readLocalDb();
      db.users = db.users.filter((u: any) => u.id !== userId);
      db.settings = db.settings.filter((s: any) => s.userId !== userId);
      db.preferences = db.preferences.filter((p: any) => p.userId !== userId);
      db.sessions = db.sessions.filter((s: any) => s.userId !== userId);
      db.securityLogs = db.securityLogs.filter((l: any) => l.userId !== userId);
      writeLocalDb(db);
    }
  }

  // --- EXPORT / IMPORT ---
  static async exportUserData(userId: string): Promise<any> {
    let profile: any = {};
    if (this.useMongo()) {
      const user = await UserModel.findById(userId);
      profile = user ? {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      } : {};
    } else {
      const db = readLocalDb();
      const user = db.users.find((u: any) => u.id === userId);
      profile = user ? {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      } : {};
    }

    const settings = await this.getSettings(userId);
    const preferences = await this.getPreferences(userId);

    // Get document metadata count or names
    let docsMetadata: any[] = [];
    if (this.useMongo()) {
      const docs = await DocumentModel.find({ userId }).select('title fileType size createdAt');
      docsMetadata = docs.map((d: any) => ({
        id: d._id,
        title: d.title,
        fileType: d.fileType,
        size: d.size,
        createdAt: d.createdAt,
      }));
    } else {
      const db = readLocalDb();
      const docs = (db.documents || []).filter((d: any) => d.userId === userId);
      docsMetadata = docs.map((d: any) => ({
        id: d.id,
        title: d.title,
        fileType: d.fileType,
        size: d.size,
        createdAt: d.createdAt,
      }));
    }

    // Get Chat history
    let chatHistory: any[] = [];
    if (this.useMongo()) {
      const chats = await ChatModel.find({ userId });
      chatHistory = chats.map((c: any) => ({
        id: c._id,
        title: c.title,
        createdAt: c.createdAt,
      }));
    } else {
      const db = readLocalDb();
      const chats = (db.chats || []).filter((c: any) => c.userId === userId);
      chatHistory = chats.map((c: any) => ({
        id: c.id,
        title: c.title,
        createdAt: c.createdAt,
      }));
    }

    return {
      profile,
      settings: {
        preferredModel: settings.preferredModel,
        temperature: settings.temperature,
        maxTokens: settings.maxTokens,
        topP: settings.topP,
        streaming: settings.streaming,
        defaultDocSelection: settings.defaultDocSelection,
        autoSaveConversations: settings.autoSaveConversations,
        citationDisplay: settings.citationDisplay,
        responseLanguage: settings.responseLanguage,
        profileVisibility: settings.profileVisibility,
        searchVisibility: settings.searchVisibility,
        dataCollection: settings.dataCollection,
        analytics: settings.analytics,
        conversationHistory: settings.conversationHistory,
        personalization: settings.personalization,
      },
      preferences: {
        theme: preferences.theme,
        fontSize: preferences.fontSize,
        compactMode: preferences.compactMode,
        animationToggle: preferences.animationToggle,
        accentColor: preferences.accentColor,
        emailNotifications: preferences.emailNotifications,
        browserNotifications: preferences.browserNotifications,
        uploadNotifications: preferences.uploadNotifications,
        aiCompletionNotifications: preferences.aiCompletionNotifications,
        securityAlerts: preferences.securityAlerts,
        systemUpdates: preferences.systemUpdates,
        newsletter: preferences.newsletter,
      },
      documents: docsMetadata,
      chats: chatHistory,
      exportedAt: new Date().toISOString(),
    };
  }

  static async importUserData(userId: string, data: any): Promise<void> {
    if (!data) throw new Error('No import data provided.');

    if (data.settings) {
      await this.updateSettings(userId, data.settings);
    }
    if (data.preferences) {
      await this.updatePreferences(userId, data.preferences);
    }
  }
}
