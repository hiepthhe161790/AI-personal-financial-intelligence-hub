import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db';
import AccountModel from '@/models/Account';
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

    // 3. Build Evidence Pack
    const evidencePack = buildEvidencePack(netWorth);

    // 4. Retrieve custom API Key if available
    const userSettings = await UserSettingModel.findOne({ userId }).lean();
    let userApiKey: string | undefined;
    
    if (userSettings?.geminiApiKeyEncrypted) {
      userApiKey = decryptText(userSettings.geminiApiKeyEncrypted);
    }

    // 5. Generate AI Research Brief
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
