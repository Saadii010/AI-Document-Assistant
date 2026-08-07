import mongoose, { Schema, Document } from 'mongoose';

export interface IPricingPlan extends Document {
  name: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  storage: string;
  documents: string;
  aiRequests: string;
  support: string;
  popular: boolean;
  createdAt: Date;
}

const PricingPlanSchema = new Schema<IPricingPlan>({
  name: {
    type: String,
    required: true,
  },
  priceMonthly: {
    type: Number,
    required: true,
  },
  priceYearly: {
    type: Number,
    required: true,
  },
  features: {
    type: [String],
    required: true,
  },
  storage: {
    type: String,
    required: true,
  },
  documents: {
    type: String,
    required: true,
  },
  aiRequests: {
    type: String,
    required: true,
  },
  support: {
    type: String,
    required: true,
  },
  popular: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const PricingPlanModel = mongoose.models.PricingPlan || mongoose.model<IPricingPlan>('PricingPlan', PricingPlanSchema);
export default PricingPlanModel;
