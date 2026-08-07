import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminLog extends Document {
  adminId: mongoose.Types.ObjectId | string | null;
  action: string;
  category: 'user_management' | 'document_management' | 'system_setting' | 'security' | 'database' | 'general';
  details: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure';
  createdAt: Date;
}

const AdminLogSchema = new Schema<IAdminLog>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    action: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['user_management', 'document_management', 'system_setting', 'security', 'database', 'general'],
    },
    details: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    status: {
      type: String,
      enum: ['success', 'failure'],
      default: 'success',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

export const AdminLogModel = mongoose.models.AdminLog || mongoose.model<IAdminLog>('AdminLog', AdminLogSchema);
export default AdminLogModel;
