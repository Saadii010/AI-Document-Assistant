import mongoose, { Schema, Document } from 'mongoose';

export interface ISavedSearches extends Document {
  userId: mongoose.Types.ObjectId | string;
  name: string;
  query: string;
  filters: any;
  createdAt: Date;
  updatedAt: Date;
}

const SavedSearchesSchema = new Schema<ISavedSearches>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
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
  },
  {
    timestamps: true,
  }
);

export const SavedSearchesModel = mongoose.models.SavedSearches || mongoose.model<ISavedSearches>('SavedSearches', SavedSearchesSchema);
export default SavedSearchesModel;
