import mongoose, { Schema, Document, Model } from 'mongoose';

export type AccountType = 
  | 'CASH' 
  | 'BANK' 
  | 'SAVINGS' 
  | 'GOLD' 
  | 'STOCK' 
  | 'FUND' 
  | 'CRYPTO' 
  | 'OTHER_ASSET' 
  | 'LIABILITY';

export interface IAccount extends Document {
  userId: string;
  name: string;
  type: AccountType;
  currency: string;
  currentBalanceMinor: number;
  lastValuationAt: Date;
  isArchived: boolean;
  version: number;
  ticker?: string;      // Ticker for stock (e.g. HPG) or gold type (e.g. SJC)
  quantity?: number;    // Quantity owned (e.g. 1000 shares, 5.5 taels)
  createdAt: Date;
  updatedAt: Date;
}

const AccountSchema = new Schema<IAccount>(
  {
    userId: { type: String, required: true, default: 'owner', index: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ['CASH', 'BANK', 'SAVINGS', 'GOLD', 'STOCK', 'FUND', 'CRYPTO', 'OTHER_ASSET', 'LIABILITY'],
      default: 'CASH',
    },
    currency: { type: String, required: true, default: 'VND', uppercase: true },
    currentBalanceMinor: { type: Number, required: true, default: 0 },
    lastValuationAt: { type: Date, required: true, default: Date.now },
    isArchived: { type: Boolean, required: true, default: false },
    version: { type: Number, required: true, default: 1 },
    ticker: { type: String, trim: true, uppercase: true },
    quantity: { type: Number, min: 0 },
  },
  { timestamps: true }
);

AccountSchema.index({ userId: 1, isArchived: 1 });

export const AccountModel: Model<IAccount> = 
  mongoose.models.Account || mongoose.model<IAccount>('Account', AccountSchema, 'financial_accounts');

export default AccountModel;
