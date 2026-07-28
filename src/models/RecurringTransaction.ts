import mongoose, { Schema, Document, Model } from "mongoose";
import { TransactionType } from "./Transaction";

export interface IRecurringTransaction extends Document {
  userId: string;
  accountId: mongoose.Types.ObjectId;
  type: TransactionType;
  amountMinor: number;
  currency: string;
  category: string;
  notes?: string;
  dayOfMonth: number; // 1-28: ngày thực thi mỗi tháng
  isActive: boolean;
  lastExecutedMonth?: string; // format "YYYY-MM" để check đã chạy chưa
  createdAt: Date;
  updatedAt: Date;
}

const RecurringTransactionSchema = new Schema<IRecurringTransaction>(
  {
    userId: { type: String, required: true, default: "owner", index: true },
    accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    type: { type: String, required: true, enum: ["INCOME", "EXPENSE"] },
    amountMinor: { type: Number, required: true, min: 1 },
    currency: { type: String, required: true, default: "VND", uppercase: true },
    category: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
    dayOfMonth: { type: Number, required: true, min: 1, max: 28, default: 1 },
    isActive: { type: Boolean, required: true, default: true },
    lastExecutedMonth: { type: String }, // e.g. "2026-07"
  },
  { timestamps: true }
);

RecurringTransactionSchema.index({ userId: 1, isActive: 1 });

export const RecurringTransactionModel: Model<IRecurringTransaction> =
  mongoose.models.RecurringTransaction ||
  mongoose.model<IRecurringTransaction>(
    "RecurringTransaction",
    RecurringTransactionSchema,
    "financial_recurring_transactions"
  );

export default RecurringTransactionModel;
