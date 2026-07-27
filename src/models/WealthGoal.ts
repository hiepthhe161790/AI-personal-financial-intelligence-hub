import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWealthGoal extends Document {
  userId: string;
  name: string;              // Name of goal (e.g. Buying house VF8 🚗)
  category: 'HOUSE' | 'CAR' | 'RETIREMENT' | 'TRAVEL' | 'OTHER';
  targetAmountMinor: number; // Target amount in minor units
  currentAmountMinor: number; // Current accumulated amount in minor units
  targetDate?: Date;         // Target completion deadline
  createdAt: Date;
  updatedAt: Date;
}

const WealthGoalSchema = new Schema<IWealthGoal>(
  {
    userId: { type: String, required: true, default: 'owner', index: true },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['HOUSE', 'CAR', 'RETIREMENT', 'TRAVEL', 'OTHER'],
      default: 'OTHER',
    },
    targetAmountMinor: { type: Number, required: true, min: 0 },
    currentAmountMinor: { type: Number, required: true, default: 0, min: 0 },
    targetDate: { type: Date },
  },
  { timestamps: true }
);

const WealthGoalModel: Model<IWealthGoal> =
  mongoose.models.WealthGoal || mongoose.model<IWealthGoal>('WealthGoal', WealthGoalSchema);

export default WealthGoalModel;
