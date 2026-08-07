import mongoose, { Schema, Document } from 'mongoose';

export interface ITestimonial extends Document {
  name: string;
  company: string;
  review: string;
  rating: number;
  avatarUrl?: string;
  createdAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>({
  name: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  review: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  avatarUrl: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const TestimonialModel = mongoose.models.Testimonial || mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);
export default TestimonialModel;
