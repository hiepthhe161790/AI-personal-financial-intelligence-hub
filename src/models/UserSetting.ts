import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserSetting extends Document {
  userId: string;
  geminiApiKeyEncrypted: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSettingSchema = new Schema<IUserSetting>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    geminiApiKeyEncrypted: { type: String, default: null },
  },
  { timestamps: true }
);

export const UserSettingModel: Model<IUserSetting> =
  mongoose.models.UserSetting || mongoose.model<IUserSetting>("UserSetting", UserSettingSchema, "user_settings");

export default UserSettingModel;
