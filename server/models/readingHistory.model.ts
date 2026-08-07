import mongoose, { Schema, Document } from 'mongoose';

export interface IReadingHistory extends Document {
  userId: mongoose.Types.ObjectId | string;
  documentId: mongoose.Types.ObjectId | string;
  currentPage: number;
  progress: number; // 0 - 100
  readingTimeSeconds: number;
  lastPosition?: string;
  lastViewedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReadingHistorySchema = new Schema<IReadingHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    documentId: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
    },
    currentPage: {
      type: Number,
      default: 1,
    },
    progress: {
      type: Number,
      default: 0,
    },
    readingTimeSeconds: {
      type: Number,
      default: 0,
    },
    lastPosition: {
      type: String,
      default: '',
    },
    lastViewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const ReadingHistoryModel = mongoose.models.ReadingHistory || mongoose.model<IReadingHistory>('ReadingHistory', ReadingHistorySchema);
export default ReadingHistoryModel;
