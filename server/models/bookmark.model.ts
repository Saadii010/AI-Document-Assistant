import mongoose, { Schema, Document } from 'mongoose';

export interface IBookmark extends Document {
  userId: mongoose.Types.ObjectId | string;
  documentId: mongoose.Types.ObjectId | string;
  title: string;
  page: number;
  paragraphIndex?: number;
  createdAt: Date;
  updatedAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>(
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
    title: {
      type: String,
      required: true,
      trim: true,
    },
    page: {
      type: Number,
      required: true,
    },
    paragraphIndex: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for lightning-fast bookmarks retrieval per user and document
BookmarkSchema.index({ userId: 1, documentId: 1 });

export const BookmarkModel = mongoose.models.Bookmark || mongoose.model<IBookmark>('Bookmark', BookmarkSchema);
export default BookmarkModel;
