import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/db";
import TransactionModel from "@/models/Transaction";
import AccountModel from "@/models/Account";
import ValuationSnapshotModel from "@/models/ValuationSnapshot";
import { authOptions } from "@/lib/auth";

async function getUserId() {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string })?.id || "owner";
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const transactionId = params.id;
    const userId = await getUserId();

    await connectToDatabase();

    // 1. Fetch the transaction and verify ownership
    const transaction = await TransactionModel.findOne({ _id: transactionId, userId });
    if (!transaction) {
      return NextResponse.json(
        { status: "error", message: "Giao dịch không tồn tại hoặc không thuộc quyền sở hữu của bạn" },
        { status: 404 }
      );
    }

    // 2. Fetch the linked account
    const account = await AccountModel.findOne({ _id: transaction.accountId, userId });
    if (account) {
      // 3. Reverse the transaction impact on the account balance
      let correctedBalanceMinor = account.currentBalanceMinor;
      if (transaction.type === "EXPENSE") {
        // Re-add deleted expense back to balance
        correctedBalanceMinor += transaction.amountMinor;
      } else {
        // Subtract deleted income from balance
        correctedBalanceMinor -= transaction.amountMinor;
      }

      // 4. Save the corrected account balance
      account.currentBalanceMinor = correctedBalanceMinor;
      account.lastValuationAt = new Date();
      account.version += 1;
      await account.save();

      // 5. Create a correcting valuation snapshot to maintain Net Worth timeline sync
      await ValuationSnapshotModel.create({
        userId,
        accountId: account._id,
        amountMinor: correctedBalanceMinor,
        currency: account.currency,
        valuationDate: new Date(),
        notes: `Hủy bỏ giao dịch [${transaction.type === "INCOME" ? "Thu nhập" : "Chi phí"}]: ${transaction.category} - Hoàn số dư`,
      });
    }

    // 6. Delete the transaction record
    await TransactionModel.deleteOne({ _id: transaction._id });

    return NextResponse.json({
      status: "success",
      message: "Đã xóa giao dịch và hoàn lại số dư tài sản thành công",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lỗi khi xóa giao dịch";
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
