import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/db';
import AccountModel from '@/models/Account';
import { computeNetWorth } from '@/domain/net-worth';
import { majorToMinor } from '@/domain/money';
import { calculateScenarioProjection } from '@/domain/simulation';

const ScenarioRequestSchema = z.object({
  initialNetWorthMajor: z.number().optional(),
  monthlyContributionMajor: z.number().min(0, 'Số tiền tiết kiệm/tháng không được âm'),
  annualReturnRatePercent: z.number().min(0).max(100).default(8),
  annualInflationRatePercent: z.number().min(0).max(50).default(3.0),
  horizonYears: z.number().min(1).max(50).default(10),
  targetGoalMajor: z.number().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = ScenarioRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { status: 'error', errors: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      initialNetWorthMajor,
      monthlyContributionMajor,
      annualReturnRatePercent,
      annualInflationRatePercent,
      horizonYears,
      targetGoalMajor,
    } = parseResult.data;

    let initialNetWorthMinor = 0;

    // If initialNetWorth is provided, convert major to minor; otherwise fetch current active Net Worth from DB
    if (initialNetWorthMajor !== undefined) {
      initialNetWorthMinor = majorToMinor(initialNetWorthMajor, 'VND');
    } else {
      await connectToDatabase();
      const accounts = await AccountModel.find({ userId: 'owner', isArchived: false }).lean();
      const netWorth = computeNetWorth(accounts);
      initialNetWorthMinor = Math.max(0, netWorth.netWorthMinor);
    }

    const monthlyContributionMinor = majorToMinor(monthlyContributionMajor, 'VND');
    const targetGoalMinor = targetGoalMajor ? majorToMinor(targetGoalMajor, 'VND') : 0;

    const projectionResult = calculateScenarioProjection({
      initialNetWorthMinor,
      monthlyContributionMinor,
      annualReturnRatePercent,
      annualInflationRatePercent,
      horizonYears,
      targetGoalMinor,
    });

    return NextResponse.json({
      status: 'success',
      data: projectionResult,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi khi tính toán kịch bản mô phỏng';
    return NextResponse.json({ status: 'error', message }, { status: 500 });
  }
}
