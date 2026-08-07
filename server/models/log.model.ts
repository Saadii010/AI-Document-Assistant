import mongoose, { Schema, Document } from 'mongoose';

export interface IProcessingLog {
  document: mongoose.Types.ObjectId | string;
  owner: mongoose.Types.ObjectId | string;
  startTime: Date;
  endTime: Date | null;
  duration: number; // in milliseconds
  errors: string[];
  retries: number;
  chunkCount: number;
  embeddingCount: number;
  logs: string[]; // detailed execution step messages
  createdAt?: Date;
  updatedAt?: Date;
}

const ProcessingLogSchema = new Schema<IProcessingLog>(
  {
    document: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number,
      default: 0, // in ms
    },
    errors: {
      type: [String],
      default: [],
    },
    retries: {
      type: Number,
      default: 0,
    },
    chunkCount: {
      type: Number,
      default: 0,
    },
    embeddingCount: {
      type: Number,
      default: 0,
    },
    logs: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

ProcessingLogSchema.index({ document: 1 });
ProcessingLogSchema.index({ owner: 1 });

export const ProcessingLogModel = mongoose.models.ProcessingLog || mongoose.model<IProcessingLog>('ProcessingLog', ProcessingLogSchema);
export default ProcessingLogModel;
