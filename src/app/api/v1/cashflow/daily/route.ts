import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import TransactionModel from '@/models/Transaction';
import { getUserIdFromSession } from '@/lib/auth';

export interface DailyFlow {
  date: string;              // "YYYY-MM-DD"
  totalIncomeMinor: number;
  totalExpenseMinor: number;
  incomeCategories: Record<string, number>;
  expenseCategories: Record<string, number>;
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const userId = await getUserIdFromSession();
    const daysParam = request.nextUrl.searchParams.get('days');
    const days = Math.min(Math.max(parseInt(daysParam ?? '30', 10), 7), 90);

    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const transactions = await TransactionModel.find({
      userId,
      occurredOn: { $gte: since },
    })
      .sort({ occurredOn: 1 })
      .lean();

    // Build a map of date → daily flow
    const flowMap = new Map<string, DailyFlow>();

    // Pre-fill every day in the range with zero values so gaps appear as empty bars
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      flowMap.set(key, {
        date: key,
        totalIncomeMinor: 0,
        totalExpenseMinor: 0,
        incomeCategories: {},
        expenseCategories: {},
      });
    }

    // Aggregate transactions into the map
    for (const tx of transactions) {
      const key = new Date(tx.occurredOn).toISOString().split('T')[0];
      const entry = flowMap.get(key);
      if (!entry) continue;

      if (tx.type === 'INCOME') {
        entry.totalIncomeMinor += tx.amountMinor;
        entry.incomeCategories[tx.category] =
          (entry.incomeCategories[tx.category] ?? 0) + tx.amountMinor;
      } else {
        entry.totalExpenseMinor += tx.amountMinor;
        entry.expenseCategories[tx.category] =
          (entry.expenseCategories[tx.category] ?? 0) + tx.amountMinor;
      }
    }

    const data = Array.from(flowMap.values());

    const totalIncomeMinor = data.reduce((s, d) => s + d.totalIncomeMinor, 0);
    const totalExpenseMinor = data.reduce((s, d) => s + d.totalExpenseMinor, 0);

    return NextResponse.json({
      data,
      summary: {
        days,
        totalIncomeMinor,
        totalExpenseMinor,
        netCashFlowMinor: totalIncomeMinor - totalExpenseMinor,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi khi tải dữ liệu dòng tiền';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
