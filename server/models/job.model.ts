import mongoose, { Schema, Document } from 'mongoose';

export interface IProcessingJob {
  document: mongoose.Types.ObjectId | string;
  owner: mongoose.Types.ObjectId | string;
  status: 'uploaded' | 'processing' | 'completed' | 'failed' | 'retrying' | 'cancelled';
  attempts: number;
  maxAttempts: number;
  errors: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const ProcessingJobSchema = new Schema<IProcessingJob>(
  {
    document: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      unique: true, // Only one job active per document
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'completed', 'failed', 'retrying', 'cancelled'],
      default: 'uploaded',
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 3,
    },
    errors: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

ProcessingJobSchema.index({ status: 1 });
ProcessingJobSchema.index({ owner: 1 });

export const ProcessingJobModel = mongoose.models.ProcessingJob || mongoose.model<IProcessingJob>('ProcessingJob', ProcessingJobSchema);
export default ProcessingJobModel;
