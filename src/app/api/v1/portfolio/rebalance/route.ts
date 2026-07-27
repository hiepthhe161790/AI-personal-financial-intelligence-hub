import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import AccountModel from '@/models/Account';
import { computeNetWorth } from '@/domain/net-worth';
import { calculatePortfolioRebalance, DEFAULT_TARGET_ALLOCATION, TargetAllocation } from '@/domain/portfolio-rebalance';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const customTargets: TargetAllocation = body.targets || DEFAULT_TARGET_ALLOCATION;

    await connectToDatabase();
    const accounts = await AccountModel.find({}).lean();

    const overview = computeNetWorth(accounts as Parameters<typeof computeNetWorth>[0]);
    const result = calculatePortfolioRebalance(overview, customTargets);

    return NextResponse.json({
      status: 'success',
      data: result,
    });
  } catch (err: unknown) {
    console.error('Portfolio rebalance API error:', err);
    const message = err instanceof Error ? err.message : 'Lỗi khi tính toán tái cân đối danh mục.';
    return NextResponse.json(
      { status: 'error', message },
      { status: 500 }
    );
  }
}
