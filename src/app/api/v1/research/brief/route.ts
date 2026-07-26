import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import AccountModel from '@/models/Account';
import { computeNetWorth } from '@/domain/net-worth';
import { buildEvidencePack } from '@/domain/evidence-pack';
import { generateResearchBrief } from '@/lib/ai';

export async function POST() {
  try {
    await connectToDatabase();

    // 1. Fetch Active Accounts
    const accounts = await AccountModel.find({ userId: 'owner', isArchived: false }).lean();

    // 2. Compute Net Worth Overview
    const netWorth = computeNetWorth(accounts);

    // 3. Build Evidence Pack
    const evidencePack = buildEvidencePack(netWorth);

    // 4. Generate AI Research Brief
    const brief = await generateResearchBrief(evidencePack);

    return NextResponse.json({
      status: 'success',
      data: {
        evidencePack,
        brief,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi khi tổng hợp báo cáo phân tích AI';
    return NextResponse.json({ status: 'error', message }, { status: 500 });
  }
}
