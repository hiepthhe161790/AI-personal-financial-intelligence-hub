import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBudget extends Document {
  userId: string;
  category: string;      // Category name (e.g., Eating)
  limitMinor: number;    // Spending limit in minor units
  currency: string;      // VND, USD
  period: string;        // 'MONTHLY', etc.
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema = new Schema<IBudget>(
  {
    userId: { type: String, required: true, default: 'owner', index: true },
    category: { type: String, required: true, trim: true },
    limitMinor: { type: Number, required: true, default: 0 },
    currency: { type: String, required: true, default: 'VND', uppercase: true },
    period: { type: String, required: true, default: 'MONTHLY' },
  },
  { timestamps: true }
);

// Compound index to guarantee uniqueness of category per user
BudgetSchema.index({ userId: 1, category: 1 }, { unique: true });

const BudgetModel: Model<IBudget> =
  mongoose.models.Budget || mongoose.model<IBudget>('Budget', BudgetSchema);

export default BudgetModel;
