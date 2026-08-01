import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/db";
import UserSettingModel from "@/models/UserSetting";
import { authOptions } from "@/lib/auth";
import { encryptText, decryptText } from "@/lib/encryption";

async function getUserId() {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string })?.id || "owner";
}

export async function GET() {
  try {
    await connectToDatabase();
    const userId = await getUserId();

    const settings = await UserSettingModel.findOne({ userId }).lean();
    const hasApiKey = !!settings?.geminiApiKeyEncrypted;
    const hasTelegramBotToken = !!settings?.telegramBotTokenEncrypted;
    const telegramChatId = settings?.telegramChatIdEncrypted ? decryptText(settings.telegramChatIdEncrypted) : "";

    return NextResponse.json({
      status: "success",
      data: {
        hasApiKey,
        hasTelegramBotToken,
        telegramChatId,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lỗi khi truy vấn cấu hình người dùng";
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { geminiApiKey, telegramBotToken, telegramChatId } = body;

    const userId = await getUserId();
    await connectToDatabase();

    const updateFields: any = {};
    if (geminiApiKey !== undefined) {
      updateFields.geminiApiKeyEncrypted = geminiApiKey && geminiApiKey.trim() !== "" ? encryptText(geminiApiKey.trim()) : null;
    }

    const isClearTelegram = telegramBotToken === "" && telegramChatId === "";
    if (isClearTelegram) {
      updateFields.telegramBotTokenEncrypted = null;
      updateFields.telegramChatIdEncrypted = null;
    } else {
      if (telegramBotToken !== undefined && telegramBotToken.trim() !== "") {
        updateFields.telegramBotTokenEncrypted = encryptText(telegramBotToken.trim());
      }
      if (telegramChatId !== undefined && telegramChatId.trim() !== "") {
        updateFields.telegramChatIdEncrypted = encryptText(telegramChatId.trim());
      }
    }

    const settings = await UserSettingModel.findOneAndUpdate(
      { userId },
      { $set: updateFields },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      status: "success",
      data: {
        hasApiKey: !!settings.geminiApiKeyEncrypted,
        hasTelegramBotToken: !!settings.telegramBotTokenEncrypted,
        telegramChatId: settings.telegramChatIdEncrypted ? decryptText(settings.telegramChatIdEncrypted) : "",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lỗi khi cập nhật cấu hình";
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
