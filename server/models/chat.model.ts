import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
  title: string;
  documentId?: mongoose.Types.ObjectId | string | null;
  userId: mongoose.Types.ObjectId | string;
  lastMessage?: string;
  messageCount: number;
  favorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    title: {
      type: String,
      required: [true, 'Chat title is required'],
      trim: true,
    },
    documentId: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
      default: null,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastMessage: {
      type: String,
      default: '',
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast querying and sorting of user conversations
ChatSchema.index({ userId: 1, updatedAt: -1 });
ChatSchema.index({ documentId: 1 });

export const ChatModel = mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);
export default ChatModel;
