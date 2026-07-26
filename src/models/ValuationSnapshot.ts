import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IValuationSnapshot extends Document {
  userId: string;
  accountId: mongoose.Types.ObjectId;
  amountMinor: number;
  currency: string;
  valuationDate: Date;
  notes?: string;
  createdAt: Date;
}

const ValuationSnapshotSchema = new Schema<IValuationSnapshot>(
  {
    userId: { type: String, required: true, default: 'owner', index: true },
    accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true, index: true },
    amountMinor: { type: Number, required: true },
    currency: { type: String, required: true, default: 'VND', uppercase: true },
    valuationDate: { type: Date, required: true, default: Date.now },
    notes: { type: String, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ValuationSnapshotSchema.index({ accountId: 1, valuationDate: -1 });

export const ValuationSnapshotModel: Model<IValuationSnapshot> = 
  mongoose.models.ValuationSnapshot || 
  mongoose.model<IValuationSnapshot>('ValuationSnapshot', ValuationSnapshotSchema, 'valuation_snapshots');

export default ValuationSnapshotModel;
