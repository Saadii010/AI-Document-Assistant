import mongoose, { Schema, Document } from 'mongoose';

export interface IFaq extends Document {
  question: string;
  answer: string;
  category?: string;
  createdAt: Date;
}

const FaqSchema = new Schema<IFaq>({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    default: 'General',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const FaqModel = mongoose.models.Faq || mongoose.model<IFaq>('Faq', FaqSchema);
export default FaqModel;
