import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { RecurringTransactionModel } from "@/models/RecurringTransaction";
import { getUserIdFromSession } from "@/lib/auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectToDatabase();
  const { id } = await params;
  const userId = await getUserIdFromSession();
  const deleted = await RecurringTransactionModel.findOneAndDelete({
    _id: id,
    userId,
  });
  if (!deleted) {
    return NextResponse.json({ success: false, error: "Không tìm thấy." }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
