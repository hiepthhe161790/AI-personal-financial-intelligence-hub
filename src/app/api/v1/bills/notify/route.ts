import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { BillReminderModel } from "@/models/BillReminder";
import { getUserIdFromSession } from "@/lib/auth";

async function sendTelegramMessage(text: string): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId || botToken === "your_telegram_bot_token_here") {
    console.log("[Bills/Notify] Telegram not configured, skipping.");
    return false;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function formatVND(minor: number): string {
  return (minor / 1).toLocaleString("vi-VN") + " ₫";
}

/**
 * POST /api/v1/bills/notify
 * Checks all active bill reminders and sends Telegram notifications
 * for bills due within `reminderDaysBefore` days.
 * Idempotent per month: uses lastNotifiedMonth to prevent spam.
 */
export async function POST() {
  await connectToDatabase();
  const userId = await getUserIdFromSession();

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentDay = now.getDate();

  const bills = await BillReminderModel.find({ userId, isActive: true }).lean();

  const notified: string[] = [];

  for (const bill of bills) {
    // Skip already notified this month
    if (bill.lastNotifiedMonth === currentMonth) continue;

    const daysUntilDue = bill.dueDayOfMonth - currentDay;

    // Only notify if within reminder window or overdue
    if (daysUntilDue > bill.reminderDaysBefore || daysUntilDue < -5) continue;

    let urgencyEmoji = "🔔";
    let urgencyText = `còn ${daysUntilDue} ngày`;
    if (daysUntilDue <= 0) {
      urgencyEmoji = "🚨";
      urgencyText = daysUntilDue === 0 ? "HÔM NAY đến hạn!" : `quá hạn ${Math.abs(daysUntilDue)} ngày!`;
    } else if (daysUntilDue <= 2) {
      urgencyEmoji = "⚠️";
    }

    const msg =
      `${urgencyEmoji} <b>Nhắc Nhở Thanh Toán</b>\n\n` +
      `📋 <b>${bill.name}</b>\n` +
      `💰 Số tiền: <b>${formatVND(bill.amountMinor)}</b>\n` +
      `🗓️ Ngày đến hạn: <b>ngày ${bill.dueDayOfMonth} hàng tháng</b>\n` +
      `⏰ Trạng thái: ${urgencyText}\n` +
      `📂 Danh mục: ${bill.category}\n` +
      (bill.notes ? `📝 Ghi chú: ${bill.notes}\n` : "") +
      `\n<i>AI Financial Hub — Nhắc nhở tự động</i>`;

    const sent = await sendTelegramMessage(msg);
    if (sent) {
      await BillReminderModel.findByIdAndUpdate(bill._id, { lastNotifiedMonth: currentMonth });
      notified.push(String(bill._id));
    }
  }

  return NextResponse.json({
    success: true,
    message: `Đã gửi ${notified.length} thông báo Telegram nhắc thanh toán.`,
    notified: notified.length,
  });
}

