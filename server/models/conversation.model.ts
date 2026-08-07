import mongoose, { Schema, Document } from 'mongoose';

export interface IChatSettings {
  temperature: number;
  maxTokens: number;
  topP: number;
  model: string;
}

export interface IConversation extends Document {
  title: string;
  userId: mongoose.Types.ObjectId | string;
  documentIds: (mongoose.Types.ObjectId | string)[]; // Empty list = all documents, otherwise selected documents
  isPinned: boolean;
  isFavorite: boolean;
  isArchived: boolean;
  settings: IChatSettings;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSettingsSchema = new Schema<IChatSettings>({
  temperature: { type: Number, default: 0.7 },
  maxTokens: { type: Number, default: 2048 },
  topP: { type: Number, default: 0.95 },
  model: { type: String, default: 'gemini-3.6-flash' },
}, { _id: false });

const ConversationSchema = new Schema<IConversation>(
  {
    title: {
      type: String,
      required: [true, 'Conversation title is required'],
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    documentIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Document',
      default: [],
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    settings: {
      type: ChatSettingsSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

export const ConversationModel = mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);
export default ConversationModel;
