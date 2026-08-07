import mongoose, { Schema, Document } from 'mongoose';

export interface IUserPreferences extends Document {
  userId: mongoose.Types.ObjectId | string;
  theme: 'light' | 'dark' | 'system';
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
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
  createdAt: Date;
  updatedAt: Date;
}

const UserPreferencesSchema = new Schema<IUserPreferences>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    fontSize: {
      type: String,
      enum: ['sm', 'base', 'lg', 'xl'],
      default: 'base',
    },
    compactMode: {
      type: Boolean,
      default: false,
    },
    animationToggle: {
      type: Boolean,
      default: true,
    },
    accentColor: {
      type: String,
      default: 'indigo',
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    browserNotifications: {
      type: Boolean,
      default: true,
    },
    uploadNotifications: {
      type: Boolean,
      default: true,
    },
    aiCompletionNotifications: {
      type: Boolean,
      default: true,
    },
    securityAlerts: {
      type: Boolean,
      default: true,
    },
    systemUpdates: {
      type: Boolean,
      default: true,
    },
    newsletter: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const UserPreferencesModel = mongoose.models.UserPreferences || mongoose.model<IUserPreferences>('UserPreferences', UserPreferencesSchema);
export default UserPreferencesModel;
