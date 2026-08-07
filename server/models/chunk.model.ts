import mongoose, { Schema, Document } from 'mongoose';

export interface IDocumentChunk extends Document {
  document: mongoose.Types.ObjectId | string;
  owner: mongoose.Types.ObjectId | string;
  chunkId: string;
  text: string;
  pageNumber: number;
  charCount: number;
  wordCount: number;
  index: number;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentChunkSchema = new Schema<IDocumentChunk>(
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
    chunkId: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    pageNumber: {
      type: Number,
      required: true,
    },
    charCount: {
      type: Number,
      required: true,
    },
    wordCount: {
      type: Number,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexing for faster retrievals
DocumentChunkSchema.index({ document: 1 });
DocumentChunkSchema.index({ owner: 1 });

export const DocumentChunkModel = mongoose.models.DocumentChunk || mongoose.model<IDocumentChunk>('DocumentChunk', DocumentChunkSchema);
export default DocumentChunkModel;
