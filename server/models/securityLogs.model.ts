import mongoose, { Schema, Document } from 'mongoose';

export interface ISecurityLog extends Document {
  userId: mongoose.Types.ObjectId | string;
  action: string;
  ipAddress: string;
  browser: string;
  os: string;
  country: string;
  timestamp: Date;
}

const SecurityLogSchema = new Schema<ISecurityLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    browser: {
      type: String,
      default: 'Unknown Browser',
    },
    os: {
      type: String,
      default: 'Unknown OS',
    },
    country: {
      type: String,
      default: 'Localhost',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }
);

export const SecurityLogModel = mongoose.models.SecurityLog || mongoose.model<ISecurityLog>('SecurityLog', SecurityLogSchema);
export default SecurityLogModel;
