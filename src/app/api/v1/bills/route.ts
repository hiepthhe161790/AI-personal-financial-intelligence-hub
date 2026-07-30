import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { BillReminderModel } from "@/models/BillReminder";
import { getUserIdFromSession } from "@/lib/auth";

export async function GET() {
  await connectToDatabase();
  const userId = await getUserIdFromSession();
  const bills = await BillReminderModel.find({ userId })
    .sort({ dueDayOfMonth: 1 })
    .lean();
  return NextResponse.json({ success: true, data: bills });
}

export async function POST(req: NextRequest) {
  await connectToDatabase();
  const userId = await getUserIdFromSession();
  const body = await req.json();
  const { name, amountMinor, currency, category, dueDayOfMonth, reminderDaysBefore, notes } = body;

  if (!name || !dueDayOfMonth) {
    return NextResponse.json({ success: false, error: "Thiếu thông tin bắt buộc." }, { status: 400 });
  }

  const created = await BillReminderModel.create({
    userId,
    name: name.trim(),
    amountMinor: Math.round(Number(amountMinor || 0)),
    currency: currency || "VND",
    category: (category || "Khác").trim(),
    dueDayOfMonth: Math.max(1, Math.min(28, Number(dueDayOfMonth))),
    reminderDaysBefore: Math.max(1, Math.min(14, Number(reminderDaysBefore || 3))),
    isActive: true,
    notes: notes?.trim(),
  });

  return NextResponse.json({ success: true, data: created }, { status: 201 });
}

