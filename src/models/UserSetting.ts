import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserSetting extends Document {
  userId: string;
  geminiApiKeyEncrypted: string | null;
  telegramBotTokenEncrypted: string | null;
  telegramChatIdEncrypted: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSettingSchema = new Schema<IUserSetting>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    geminiApiKeyEncrypted: { type: String, default: null },
    telegramBotTokenEncrypted: { type: String, default: null },
    telegramChatIdEncrypted: { type: String, default: null },
  },
  { timestamps: true }
);

if (mongoose.models.UserSetting) {
  delete mongoose.models.UserSetting;
}

export const UserSettingModel: Model<IUserSetting> =
  mongoose.model<IUserSetting>("UserSetting", UserSettingSchema, "user_settings");

export default UserSettingModel;
