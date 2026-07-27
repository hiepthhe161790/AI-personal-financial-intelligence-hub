import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/db";
import UserSettingModel from "@/models/UserSetting";
import { authOptions } from "@/lib/auth";
import { encryptText } from "@/lib/encryption";

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

    return NextResponse.json({
      status: "success",
      data: {
        hasApiKey,
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
    const { geminiApiKey } = body;

    const userId = await getUserId();
    await connectToDatabase();

    let geminiApiKeyEncrypted = null;
    if (geminiApiKey && geminiApiKey.trim() !== "") {
      geminiApiKeyEncrypted = encryptText(geminiApiKey.trim());
    }

    const settings = await UserSettingModel.findOneAndUpdate(
      { userId },
      { geminiApiKeyEncrypted },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      status: "success",
      data: {
        hasApiKey: !!settings.geminiApiKeyEncrypted,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lỗi khi cập nhật cấu hình";
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
