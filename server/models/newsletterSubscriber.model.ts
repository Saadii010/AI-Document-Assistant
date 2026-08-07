import mongoose, { Schema, Document } from 'mongoose';

export interface INewsletterSubscriber extends Document {
  email: string;
  subscribedAt: Date;
}

const NewsletterSubscriberSchema = new Schema<INewsletterSubscriber>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
});

export const NewsletterSubscriberModel = mongoose.models.NewsletterSubscriber || mongoose.model<INewsletterSubscriber>('NewsletterSubscriber', NewsletterSubscriberSchema);
export default NewsletterSubscriberModel;
