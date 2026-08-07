import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  userId: mongoose.Types.ObjectId | string;
  action: 'login' | 'upload' | 'chat_start' | 'profile_update' | 'password_change' | 'favorite_add' | 'favorite_remove';
  details: string;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: ['login', 'upload', 'chat_start', 'profile_update', 'password_change', 'favorite_add', 'favorite_remove'],
    },
    details: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

export const ActivityModel = mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);
export default ActivityModel;
