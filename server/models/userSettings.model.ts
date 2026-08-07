import mongoose, { Schema, Document } from 'mongoose';

export interface IUserSettings extends Document {
  userId: mongoose.Types.ObjectId | string;
  preferredModel: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  streaming: boolean;
  defaultDocSelection: string;
  autoSaveConversations: boolean;
  citationDisplay: boolean;
  responseLanguage: string;
  profileVisibility: 'public' | 'private' | 'contacts';
  searchVisibility: boolean;
  dataCollection: boolean;
  analytics: boolean;
  conversationHistory: boolean;
  personalization: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSettingsSchema = new Schema<IUserSettings>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    preferredModel: {
      type: String,
      default: 'Gemini 1.5 Flash',
    },
    temperature: {
      type: Number,
      default: 0.7,
    },
    maxTokens: {
      type: Number,
      default: 2048,
    },
    topP: {
      type: Number,
      default: 0.95,
    },
    streaming: {
      type: Boolean,
      default: true,
    },
    defaultDocSelection: {
      type: String,
      default: 'all',
    },
    autoSaveConversations: {
      type: Boolean,
      default: true,
    },
    citationDisplay: {
      type: Boolean,
      default: true,
    },
    responseLanguage: {
      type: String,
      default: 'en',
    },
    profileVisibility: {
      type: String,
      enum: ['public', 'private', 'contacts'],
      default: 'private',
    },
    searchVisibility: {
      type: Boolean,
      default: true,
    },
    dataCollection: {
      type: Boolean,
      default: true,
    },
    analytics: {
      type: Boolean,
      default: true,
    },
    conversationHistory: {
      type: Boolean,
      default: true,
    },
    personalization: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const UserSettingsModel = mongoose.models.UserSettings || mongoose.model<IUserSettings>('UserSettings', UserSettingsSchema);
export default UserSettingsModel;
