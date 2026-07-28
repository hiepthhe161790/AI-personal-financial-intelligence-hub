import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { RecurringTransactionModel } from "@/models/RecurringTransaction";
import { TransactionModel } from "@/models/Transaction";

const USER_ID = "owner";

/**
 * POST /api/v1/recurring/execute
 * Checks all active recurring transactions and auto-creates real Transaction
 * entries for any that haven't been executed this month yet.
 * Safe to call multiple times (idempotent per month via lastExecutedMonth).
 */
export async function POST() {
  await connectToDatabase();

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`; // e.g. "2026-07"
  const currentDay = now.getDate();

  // Get all active recurring templates for this user
  const templates = await RecurringTransactionModel.find({
    userId: USER_ID,
    isActive: true,
  }).lean();

  const executed: string[] = [];
  const skipped: string[] = [];

  for (const t of templates) {
    // Skip if already executed this month
    if (t.lastExecutedMonth === currentMonth) {
      skipped.push(String(t._id));
      continue;
    }

    // Only execute if today >= the scheduled day of month
    if (currentDay < t.dayOfMonth) {
      skipped.push(String(t._id));
      continue;
    }

    // Create the actual Transaction in the ledger
    await TransactionModel.create({
      userId: USER_ID,
      accountId: t.accountId,
      type: t.type,
      amountMinor: t.amountMinor,
      currency: t.currency,
      category: t.category,
      notes: t.notes || `[Tự động] ${t.category}`,
      occurredOn: new Date(now.getFullYear(), now.getMonth(), t.dayOfMonth),
    });

    // Mark this template as executed for this month
    await RecurringTransactionModel.findByIdAndUpdate(t._id, {
      lastExecutedMonth: currentMonth,
    });

    executed.push(String(t._id));
  }

  return NextResponse.json({
    success: true,
    message: `Đã tự động ghi ${executed.length} giao dịch định kỳ. Bỏ qua ${skipped.length} mục.`,
    executed: executed.length,
    skipped: skipped.length,
  });
}

