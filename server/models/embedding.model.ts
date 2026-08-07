import mongoose, { Schema, Document } from 'mongoose';

export interface IEmbedding extends Document {
  chunk: mongoose.Types.ObjectId | string;
  document: mongoose.Types.ObjectId | string;
  owner: mongoose.Types.ObjectId | string;
  vector: number[];
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const EmbeddingSchema = new Schema<IEmbedding>(
  {
    chunk: {
      type: Schema.Types.ObjectId,
      ref: 'DocumentChunk',
      required: true,
    },
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
    vector: {
      type: [Number],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

EmbeddingSchema.index({ document: 1 });
EmbeddingSchema.index({ owner: 1 });

export const EmbeddingModel = mongoose.models.Embedding || mongoose.model<IEmbedding>('Embedding', EmbeddingSchema);
export default EmbeddingModel;
