import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/db';
import WealthGoalModel from '@/models/WealthGoal';
import TransactionModel from '@/models/Transaction';
import { majorToMinor } from '@/domain/money';
import { authOptions } from '@/lib/auth';

const CreateGoalSchema = z.object({
  name: z.string().min(1, 'Tên mục tiêu không được để trống'),
  category: z.enum(['HOUSE', 'CAR', 'RETIREMENT', 'TRAVEL', 'OTHER']),
  targetAmountMajor: z.number().min(0.01, 'Số tiền mục tiêu phải lớn hơn 0'),
  currentAmountMajor: z.number().min(0, 'Số tiền hiện có không được âm'),
  targetDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
});

async function getUserId() {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string })?.id || 'owner';
}

export async function GET() {
  try {
    await connectToDatabase();
    const userId = await getUserId();

    // 1. Fetch current month boundaries
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // 2. Query transactions this month to compute monthly savings rate
    const transactions = await TransactionModel.find({
      userId,
      occurredOn: { $gte: startOfMonth, $lte: endOfMonth }
    }).lean();

    let totalIncomeMinor = 0;
    let totalExpenseMinor = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'INCOME') {
        totalIncomeMinor += tx.amountMinor;
      } else if (tx.type === 'EXPENSE') {
        totalExpenseMinor += tx.amountMinor;
      }
    });

    const monthlySavingsMinor = totalIncomeMinor - totalExpenseMinor;
    const isSavingsNegative = monthlySavingsMinor <= 0;

    // Fallback savings rate: 10,000,000 VND (1,000,000,000 minor)
    const activeSavingsMinor = monthlySavingsMinor > 0 ? monthlySavingsMinor : 1000000000;

    // 3. Fetch user wealth goals
    const goals = await WealthGoalModel.find({ userId }).sort({ createdAt: -1 }).lean();

    // 4. Enrich goals with remaining months and estimated completion dates
    const enrichedGoals = goals.map((goal) => {
      const remainingMinor = goal.targetAmountMinor - goal.currentAmountMinor;
      let remainingMonths = 0;
      let estimatedDate = new Date();

      if (remainingMinor > 0) {
        remainingMonths = remainingMinor / activeSavingsMinor;
        estimatedDate = new Date();
        estimatedDate.setMonth(estimatedDate.getMonth() + remainingMonths);
      }

      return {
        _id: goal._id,
        name: goal.name,
        category: goal.category,
        targetAmountMinor: goal.targetAmountMinor,
        currentAmountMinor: goal.currentAmountMinor,
        targetDate: goal.targetDate,
        remainingMonths,
        estimatedDate: estimatedDate.toISOString(),
      };
    });

    return NextResponse.json({
      status: 'success',
      data: {
        goals: enrichedGoals,
        monthlySavingsMinor,
        isSavingsNegative,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi khi lấy danh sách mục tiêu tài chính';
    return NextResponse.json({ status: 'error', message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = CreateGoalSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { status: 'error', errors: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, category, targetAmountMajor, currentAmountMajor, targetDate } = parseResult.data;
    const targetAmountMinor = majorToMinor(targetAmountMajor, 'VND');
    const currentAmountMinor = majorToMinor(currentAmountMajor, 'VND');
    const userId = await getUserId();

    await connectToDatabase();

    const goal = await WealthGoalModel.create({
      userId,
      name,
      category,
      targetAmountMinor,
      currentAmountMinor,
      targetDate,
    });

    return NextResponse.json({
      status: 'success',
      data: goal,
    }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi khi tạo mục tiêu tài chính';
    return NextResponse.json({ status: 'error', message }, { status: 500 });
  }
}
