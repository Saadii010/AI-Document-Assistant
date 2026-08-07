import mongoose, { Schema, Document } from 'mongoose';

export interface IViewerSettings extends Document {
  userId: mongoose.Types.ObjectId | string;
  zoomLevel: number;
  fitMode: 'width' | 'page' | 'none';
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  sidebarTab: string;
  createdAt: Date;
  updatedAt: Date;
}

const ViewerSettingsSchema = new Schema<IViewerSettings>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    zoomLevel: {
      type: Number,
      default: 1.0,
    },
    fitMode: {
      type: String,
      enum: ['width', 'page', 'none'],
      default: 'none',
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    sidebarOpen: {
      type: Boolean,
      default: true,
    },
    sidebarTab: {
      type: String,
      default: 'pages',
    },
  },
  {
    timestamps: true,
  }
);

export const ViewerSettingsModel = mongoose.models.ViewerSettings || mongoose.model<IViewerSettings>('ViewerSettings', ViewerSettingsSchema);
export default ViewerSettingsModel;
