import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { RecurringTransactionModel } from "@/models/RecurringTransaction";

const USER_ID = "owner";

export async function GET() {
  await connectToDatabase();
  const items = await RecurringTransactionModel.find({ userId: USER_ID })
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json({ success: true, data: items });
}

export async function POST(req: NextRequest) {
  await connectToDatabase();
  const body = await req.json();
  const { accountId, type, amountMinor, currency, category, notes, dayOfMonth } = body;

  if (!accountId || !type || !amountMinor || !category || !dayOfMonth) {
    return NextResponse.json({ success: false, error: "Thiếu thông tin bắt buộc." }, { status: 400 });
  }

  const created = await RecurringTransactionModel.create({
    userId: USER_ID,
    accountId,
    type,
    amountMinor: Math.round(Number(amountMinor)),
    currency: currency || "VND",
    category: category.trim(),
    notes: notes?.trim(),
    dayOfMonth: Math.max(1, Math.min(28, Number(dayOfMonth))),
    isActive: true,
  });

  return NextResponse.json({ success: true, data: created }, { status: 201 });
}

