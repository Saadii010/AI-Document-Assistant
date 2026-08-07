import mongoose, { Schema, Document } from 'mongoose';

export interface ISearchAnalytics extends Document {
  userId: mongoose.Types.ObjectId | string;
  query: string;
  searchType: 'semantic' | 'keyword' | 'hybrid';
  responseTimeMs: number;
  hasResults: boolean;
  resultsCount: number;
  createdAt: Date;
}

const SearchAnalyticsSchema = new Schema<ISearchAnalytics>(
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
    searchType: {
      type: String,
      enum: ['semantic', 'keyword', 'hybrid'],
      required: true,
    },
    responseTimeMs: {
      type: Number,
      required: true,
    },
    hasResults: {
      type: Boolean,
      default: false,
    },
    resultsCount: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

export const SearchAnalyticsModel = mongoose.models.SearchAnalytics || mongoose.model<ISearchAnalytics>('SearchAnalytics', SearchAnalyticsSchema);
export default SearchAnalyticsModel;
