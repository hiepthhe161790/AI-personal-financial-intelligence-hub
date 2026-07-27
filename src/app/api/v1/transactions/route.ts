import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import TransactionModel from "@/models/Transaction";
import AccountModel from "@/models/Account";
import ValuationSnapshotModel from "@/models/ValuationSnapshot";
import { majorToMinor } from "@/domain/money";
import { authOptions } from "@/lib/auth";

const CreateTransactionSchema = z.object({
  accountId: z.string().min(1, "Tài khoản không được để trống"),
  type: z.enum(["INCOME", "EXPENSE"]),
  amountMajor: z.number().min(0.01, "Số tiền phải lớn hơn 0"),
  category: z.string().min(1, "Danh mục không được để trống"),
  occurredOn: z
    .string()
    .transform((val) => new Date(val))
    .default(() => new Date()),
  notes: z.string().optional(),
});

async function getUserId() {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string })?.id || "owner";
}

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const userId = await getUserId();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Fetch transactions with account population
    const transactions = await TransactionModel.find({ userId })
      .sort({ occurredOn: -1, createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate("accountId", "name type currency")
      .lean();

    const total = await TransactionModel.countDocuments({ userId });

    return NextResponse.json({
      status: "success",
      data: {
        transactions,
        total,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lỗi khi lấy danh sách giao dịch";
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = CreateTransactionSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { status: "error", errors: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { accountId, type, amountMajor, category, occurredOn, notes } = parseResult.data;
    const userId = await getUserId();

    await connectToDatabase();

    // 1. Verify and retrieve the linked account
    const account = await AccountModel.findOne({ _id: accountId, userId });
    if (!account) {
      return NextResponse.json(
        { status: "error", message: "Tài khoản liên kết không tồn tại hoặc không thuộc quyền sở hữu của bạn" },
        { status: 404 }
      );
    }

    const amountMinor = majorToMinor(amountMajor, account.currency);

    // 2. Calculate the new account balance
    let newBalanceMinor = account.currentBalanceMinor;
    if (type === "EXPENSE") {
      newBalanceMinor -= amountMinor;
    } else {
      newBalanceMinor += amountMinor;
    }

    // 3. Update the associated account balance
    account.currentBalanceMinor = newBalanceMinor;
    account.lastValuationAt = occurredOn;
    account.version += 1;
    await account.save();

    // 4. Create the Transaction record
    const transaction = await TransactionModel.create({
      userId,
      accountId: account._id,
      type,
      amountMinor,
      currency: account.currency,
      category,
      occurredOn,
      notes,
    });

    // 5. Create a corresponding Valuation Snapshot to maintain historical Net Worth chart accuracy
    await ValuationSnapshotModel.create({
      userId,
      accountId: account._id,
      amountMinor: newBalanceMinor,
      currency: account.currency,
      valuationDate: occurredOn,
      notes: `Ghi nhận thu chi [${type === "INCOME" ? "Thu nhập" : "Chi phí"}]: ${category} - ${notes || ""}`,
    });

    return NextResponse.json(
      {
        status: "success",
        data: transaction,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lỗi khi ghi nhận giao dịch mới";
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
