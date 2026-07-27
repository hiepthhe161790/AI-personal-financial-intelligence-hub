import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/db';
import BudgetModel from '@/models/Budget';
import TransactionModel from '@/models/Transaction';
import { majorToMinor } from '@/domain/money';
import { authOptions } from '@/lib/auth';

const CreateBudgetSchema = z.object({
  category: z.string().min(1, 'Danh mục không được để trống'),
  limitMajor: z.number().min(0, 'Hạn mức không được nhỏ hơn 0'),
  currency: z.string().default('VND'),
});

async function getUserId() {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string })?.id || 'owner';
}

export async function GET() {
  try {
    await connectToDatabase();
    const userId = await getUserId();

    // 1. Compute current month boundaries
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // 2. Aggregate spending by category for the current month
    const spendingAgg = await TransactionModel.aggregate([
      {
        $match: {
          userId,
          type: 'EXPENSE',
          occurredOn: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$category',
          totalSpentMinor: { $sum: '$amountMinor' },
        },
      },
    ]);

    const spendingMap = new Map<string, number>();
    spendingAgg.forEach((item) => {
      spendingMap.set(item._id, item.totalSpentMinor);
    });

    // 3. Fetch all active budgets and attach spent amounts
    const budgets = await BudgetModel.find({ userId }).sort({ category: 1 }).lean();
    
    const enrichedBudgets = budgets.map((b) => ({
      _id: b._id,
      category: b.category,
      limitMinor: b.limitMinor,
      currency: b.currency,
      period: b.period,
      spentMinor: spendingMap.get(b.category) || 0,
    }));

    return NextResponse.json({
      status: 'success',
      data: enrichedBudgets,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi khi lấy danh sách hạn mức ngân sách';
    return NextResponse.json({ status: 'error', message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = CreateBudgetSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { status: 'error', errors: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { category, limitMajor, currency } = parseResult.data;
    const limitMinor = majorToMinor(limitMajor, currency);
    const userId = await getUserId();

    await connectToDatabase();

    // Upsert budget (update if exists, create if not)
    const budget = await BudgetModel.findOneAndUpdate(
      { userId, category },
      {
        limitMinor,
        currency,
        period: 'MONTHLY',
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      status: 'success',
      data: budget,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi khi thiết lập hạn mức ngân sách';
    return NextResponse.json({ status: 'error', message }, { status: 500 });
  }
}
