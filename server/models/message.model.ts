import mongoose, { Schema, Document } from 'mongoose';

export interface ISourceCitation {
  documentId: mongoose.Types.ObjectId | string;
  documentName: string;
  pageNumber: number;
  paragraphNumber: number;
  chunkId: string;
  confidence: number;
  text: string;
}

export interface IMessageMetrics {
  responseTime: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  chunkCount: number;
  embeddingCount: number;
}

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId | string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  sources: ISourceCitation[];
  metrics: IMessageMetrics;
  rating: 'like' | 'dislike' | null;
  createdAt: Date;
  updatedAt: Date;
}

const SourceCitationSchema = new Schema<ISourceCitation>({
  documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true },
  documentName: { type: String, required: true },
  pageNumber: { type: Number, required: true },
  paragraphNumber: { type: Number, required: true },
  chunkId: { type: String, required: true },
  confidence: { type: Number, required: true },
  text: { type: String, required: true },
}, { _id: false });

const MessageMetricsSchema = new Schema<IMessageMetrics>({
  responseTime: { type: Number, default: 0 },
  promptTokens: { type: Number, default: 0 },
  completionTokens: { type: Number, default: 0 },
  totalTokens: { type: Number, default: 0 },
  chunkCount: { type: Number, default: 0 },
  embeddingCount: { type: Number, default: 0 },
}, { _id: false });

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    sender: {
      type: String,
      required: true,
      enum: ['user', 'assistant', 'system'],
    },
    text: {
      type: String,
      required: [true, 'Message text is required'],
    },
    sources: {
      type: [SourceCitationSchema],
      default: [],
    },
    metrics: {
      type: MessageMetricsSchema,
      default: () => ({}),
    },
    rating: {
      type: String,
      enum: ['like', 'dislike', null],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast ordering and retrieval of message threads
MessageSchema.index({ conversationId: 1, createdAt: 1 });

export const MessageModel = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
export default MessageModel;
