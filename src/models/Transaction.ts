import mongoose, { Schema, Document, Model } from "mongoose";

export type TransactionType = "INCOME" | "EXPENSE";

export interface ITransaction extends Document {
  userId: string;
  accountId: mongoose.Types.ObjectId;
  type: TransactionType;
  amountMinor: number;
  currency: string;
  category: string;
  occurredOn: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: String, required: true, default: "owner", index: true },
    accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    type: { type: String, required: true, enum: ["INCOME", "EXPENSE"] },
    amountMinor: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: "VND", uppercase: true },
    category: { type: String, required: true, trim: true, index: true },
    occurredOn: { type: Date, required: true, default: Date.now, index: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// Indexes for fast querying in dashboard
TransactionSchema.index({ userId: 1, occurredOn: -1 });
TransactionSchema.index({ accountId: 1, occurredOn: -1 });

export const TransactionModel: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema, "financial_transactions");

export default TransactionModel;
