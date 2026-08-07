import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument extends Document {
  title: string;
  originalFilename: string;
  storedFilename: string;
  fileType: 'pdf' | 'docx' | 'txt' | string;
  mimeType: string;
  fileSize: number;
  totalPages: number;
  owner: mongoose.Types.ObjectId | string; // Owner referencing User
  description: string;
  tags: string[];
  category: string;
  status: 'processing' | 'processed' | 'failed' | string;
  uploadDate: Date;
  lastOpened: Date | null;
  lastModified: Date;
  isFavorite: boolean;
  isArchived: boolean;
  thumbnail: string | null;
  filePath: string;
  
  // Future fields
  extractedText?: string;
  chunks?: any[];
  embeddings?: number[][];
  processingStatus?: string;

  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
    },
    originalFilename: {
      type: String,
      required: true,
    },
    storedFilename: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
      enum: ['pdf', 'docx', 'txt'],
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    totalPages: {
      type: Number,
      default: 1,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      default: 'Notes', // Research, University, Work, Personal, Invoices, Books, Notes
    },
    status: {
      type: String,
      default: 'processed',
      enum: ['processing', 'processed', 'failed'],
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    lastOpened: {
      type: Date,
      default: null,
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    thumbnail: {
      type: String,
      default: null,
    },
    filePath: {
      type: String,
      required: true,
    },
    extractedText: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for ultra-fast document search and categorization filtering
DocumentSchema.index({ owner: 1, uploadDate: -1 });
DocumentSchema.index({ status: 1 });

export const DocumentModel = mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);
export default DocumentModel;
