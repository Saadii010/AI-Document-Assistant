import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  title: string;
  type: 'users' | 'documents' | 'ai_usage' | 'storage' | 'system';
  format: 'csv' | 'excel' | 'pdf';
  generatedBy: mongoose.Types.ObjectId | string;
  filters: Record<string, any>;
  summaryData: Record<string, any>;
  downloadUrl?: string;
  createdAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    title: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['users', 'documents', 'ai_usage', 'storage', 'system'], 
      required: true 
    },
    format: { 
      type: String, 
      enum: ['csv', 'excel', 'pdf'], 
      required: true 
    },
    generatedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    filters: { type: Schema.Types.Mixed, default: {} },
    summaryData: { type: Schema.Types.Mixed, default: {} },
    downloadUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
  }
);

export const ReportModel = mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
export default ReportModel;
