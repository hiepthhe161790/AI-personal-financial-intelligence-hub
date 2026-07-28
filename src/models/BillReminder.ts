import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBillReminder extends Document {
  userId: string;
  name: string;
  amountMinor: number;
  currency: string;
  category: string; // "Vay ngân hàng" | "Bảo hiểm" | "Thẻ tín dụng" | "Thuê nhà" | "Khác"
  dueDayOfMonth: number; // 1-28: ngày đến hạn mỗi tháng
  reminderDaysBefore: number; // nhắc trước bao nhiêu ngày (1, 3, 5, 7)
  isActive: boolean;
  lastNotifiedMonth?: string; // format "YYYY-MM"
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BillReminderSchema = new Schema<IBillReminder>(
  {
    userId: { type: String, required: true, default: "owner", index: true },
    name: { type: String, required: true, trim: true },
    amountMinor: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: "VND", uppercase: true },
    category: { type: String, required: true, trim: true },
    dueDayOfMonth: { type: Number, required: true, min: 1, max: 28 },
    reminderDaysBefore: { type: Number, required: true, default: 3 },
    isActive: { type: Boolean, required: true, default: true },
    lastNotifiedMonth: { type: String },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

BillReminderSchema.index({ userId: 1, isActive: 1 });

export const BillReminderModel: Model<IBillReminder> =
  mongoose.models.BillReminder ||
  mongoose.model<IBillReminder>("BillReminder", BillReminderSchema, "financial_bill_reminders");

export default BillReminderModel;
