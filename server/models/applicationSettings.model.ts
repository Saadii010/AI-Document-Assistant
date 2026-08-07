import mongoose, { Schema, Document } from 'mongoose';

export interface IApplicationSettings extends Document {
  appName: string;
  logoUrl?: string;
  storageLimitBytes: number; // e.g., default max storage allowed in the app
  allowedFileTypes: string[]; // e.g., ['.pdf', '.docx', '.txt']
  maxUploadSizeBytes: number; // e.g., 50MB
  maintenanceMode: boolean;
  aiModelName: string; // e.g., 'gemini-2.5-flash'
  tokenLimitPerUserDay: number; // e.g., 100000
  updatedBy?: mongoose.Types.ObjectId | string;
  updatedAt: Date;
}

const ApplicationSettingsSchema = new Schema<IApplicationSettings>(
  {
    appName: { type: String, default: 'AI Knowledge Assistant' },
    logoUrl: { type: String, default: '' },
    storageLimitBytes: { type: Number, default: 10 * 1024 * 1024 * 1024 }, // 10 GB
    allowedFileTypes: { type: [String], default: ['.pdf', '.docx', '.txt'] },
    maxUploadSizeBytes: { type: Number, default: 50 * 1024 * 1024 }, // 50 MB
    maintenanceMode: { type: Boolean, default: false },
    aiModelName: { type: String, default: 'gemini-2.5-flash' },
    tokenLimitPerUserDay: { type: Number, default: 200000 },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

export const ApplicationSettingsModel = mongoose.models.ApplicationSettings || mongoose.model<IApplicationSettings>('ApplicationSettings', ApplicationSettingsSchema);
export default ApplicationSettingsModel;
