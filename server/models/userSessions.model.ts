import mongoose, { Schema, Document } from 'mongoose';

export interface IUserSession extends Document {
  userId: mongoose.Types.ObjectId | string;
  browser: string;
  os: string;
  ipAddress: string;
  country: string;
  loginTime: Date;
  currentDevice: boolean;
  userAgent: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSessionSchema = new Schema<IUserSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    browser: {
      type: String,
      default: 'Unknown Browser',
    },
    os: {
      type: String,
      default: 'Unknown OS',
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    country: {
      type: String,
      default: 'Localhost',
    },
    loginTime: {
      type: Date,
      default: Date.now,
    },
    currentDevice: {
      type: Boolean,
      default: false,
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const UserSessionModel = mongoose.models.UserSession || mongoose.model<IUserSession>('UserSession', UserSessionSchema);
export default UserSessionModel;
