import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { connectToDatabase } from "@/lib/db";
import { getUserIdFromSession } from "@/lib/auth";
import UserSettingModel from "@/models/UserSetting";
import { decryptText } from "@/lib/encryption";

const ACADEMY_SYSTEM_PROMPT = `Bạn là AI Financial Mentor — Chuyên gia tư vấn tài chính cá nhân và đầu tư dài hạn, được tích hợp trong AI Personal Financial Intelligence Hub.

VAI TRÒ & PHONG CÁCH:
- Giải thích các khái niệm tài chính một cách đơn giản, dễ hiểu, thân thiện như người thầy hướng dẫn.
- Trả lời bằng Tiếng Việt, súc tích, trực tiếp vào vấn đề.
- Dùng ví dụ thực tế với số liệu VNĐ để minh họa.
- Khuyến khích tư duy đầu tư dài hạn, kỷ luật tài chính.

GIỚI HẠN AN TOÀN BẮT BUỘC:
- KHÔNG tư vấn mua/bán mã cổ phiếu cụ thể hay crypto cụ thể.
- KHÔNG đưa ra dự đoán giá cụ thể trong tương lai.
- Chỉ giải thích nguyên lý, phương pháp, tư duy đầu tư.
- Nếu câu hỏi vi phạm giới hạn, hãy lịch sự giải thích lý do và hướng dẫn tư duy đúng đắn thay thế.

CONTEXT BÀI HỌC: Bạn đang hỗ trợ người dùng học bài học được cung cấp bên dưới. Ưu tiên trả lời liên quan đến nội dung bài học đó trước khi mở rộng sang chủ đề khác.`;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { question, lessonContext, history } = body as {
    question: string;
    lessonContext: string;
    history: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }>;
  };

  if (!question?.trim()) {
    return NextResponse.json({ success: false, error: "Câu hỏi không được để trống." }, { status: 400 });
  }

  await connectToDatabase();
  const userId = await getUserIdFromSession();

  // Retrieve user custom API Key if available, fallback to env variable
  const userSettings = await UserSettingModel.findOne({ userId }).lean();
  let apiKey = process.env.GEMINI_API_KEY;

  if (userSettings?.geminiApiKeyEncrypted) {
    try {
      apiKey = decryptText(userSettings.geminiApiKeyEncrypted);
    } catch (e) {
      console.error("[Academy/Chat] Failed to decrypt user API key:", e);
    }
  }

  // Fallback: no real API key configured
  if (!apiKey || apiKey === "mock_dev_key" || apiKey.length <= 10) {
    return NextResponse.json({
      success: true,
      reply: `📚 [Chế độ Demo] Câu hỏi của bạn: "${question}"\n\nĐể nhận phân tích AI thật từ Gemini, hãy cấu hình GEMINI_API_KEY trong file .env hoặc cài đặt API Key cá nhân trong phần Cài đặt.`,
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Build system instruction with lesson context
    const systemInstruction = `${ACADEMY_SYSTEM_PROMPT}\n\n--- NỘI DUNG BÀI HỌC ĐANG HỌC ---\n${lessonContext || "Không có bài học cụ thể."}`;

    const chat = model.startChat({
      systemInstruction,
      history: history || [],
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(question);
    const reply = result.response.text();

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    console.error("[Academy/Chat] Gemini error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi kết nối AI. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
