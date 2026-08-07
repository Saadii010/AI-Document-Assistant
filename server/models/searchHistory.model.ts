import mongoose, { Schema, Document } from 'mongoose';

export interface ISearchHistory extends Document {
  userId: mongoose.Types.ObjectId | string;
  query: string;
  filters: any;
  resultsCount: number;
  searchCount: number;
  lastSearchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SearchHistorySchema = new Schema<ISearchHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    query: {
      type: String,
      required: true,
    },
    filters: {
      type: Schema.Types.Mixed,
      default: {},
    },
    resultsCount: {
      type: Number,
      default: 0,
    },
    searchCount: {
      type: Number,
      default: 1,
    },
    lastSearchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

SearchHistorySchema.index({ userId: 1, query: 1 }, { unique: true });

export const SearchHistoryModel = mongoose.models.SearchHistory || mongoose.model<ISearchHistory>('SearchHistory', SearchHistorySchema);
export default SearchHistoryModel;
