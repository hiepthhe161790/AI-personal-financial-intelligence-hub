import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db';
import AccountModel from '@/models/Account';
import TransactionModel from '@/models/Transaction';
import UserSettingModel from '@/models/UserSetting';
import { computeNetWorth } from '@/domain/net-worth';
import { buildEvidencePack } from '@/domain/evidence-pack';
import { generateResearchBrief } from '@/lib/ai';
import { decryptText } from '@/lib/encryption';
import { authOptions } from '@/lib/auth';

async function getUserId() {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string })?.id || 'owner';
}

export async function POST() {
  try {
    await connectToDatabase();
    const userId = await getUserId();

    // 1. Fetch Active Accounts for user
    const accounts = await AccountModel.find({ userId, isArchived: false }).lean();

    // 2. Compute Net Worth Overview
    const netWorth = computeNetWorth(accounts);

    // 3. Fetch recent transactions (spending logs) for personal audit
    const transactions = await TransactionModel.find({ userId })
      .sort({ occurredOn: -1 })
      .limit(50)
      .lean();

    // Map transactions to structured evidence items
    const txEvidenceItems = transactions.map((tx, idx) => ({
      id: `EVD-TX-${idx + 1}`,
      category: 'POSITION' as const,
      title: `Giao dịch vặt: ${tx.category}`,
      source: 'Cash Flow Ledger Database',
      summary: `Loại: ${tx.type}. Số tiền: ${tx.type === 'EXPENSE' ? '-' : '+'}${tx.amountMinor}. Ghi chú: ${tx.notes || ''}`,
      date: new Date(tx.occurredOn).toISOString().split('T')[0],
    }));

    // 4. Build Evidence Pack incorporating transactions
    const evidencePack = buildEvidencePack(netWorth, txEvidenceItems);

    // 5. Retrieve custom API Key if available
    const userSettings = await UserSettingModel.findOne({ userId }).lean();
    let userApiKey: string | undefined;
    
    if (userSettings?.geminiApiKeyEncrypted) {
      userApiKey = decryptText(userSettings.geminiApiKeyEncrypted);
    }

    // 6. Generate AI Research Brief (including spending analysis)
    const brief = await generateResearchBrief(evidencePack, userApiKey);

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
