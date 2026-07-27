import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/db';
import AccountModel from '@/models/Account';
import ValuationSnapshotModel from '@/models/ValuationSnapshot';
import { computeNetWorth } from '@/domain/net-worth';
import { majorToMinor } from '@/domain/money';
import { authOptions } from '@/lib/auth';

const CreateAccountSchema = z.object({
  name: z.string().min(1, 'Tên tài sản không được để trống'),
  type: z.enum(['CASH', 'BANK', 'SAVINGS', 'GOLD', 'STOCK', 'FUND', 'CRYPTO', 'OTHER_ASSET', 'LIABILITY']),
  currency: z.string().default('VND'),
  initialBalanceMajor: z.number().min(0, 'Số dư không được nhỏ hơn 0'),
  notes: z.string().optional(),
  ticker: z.string().optional(),
  quantity: z.number().min(0).optional(),
});

async function getUserId() {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string })?.id || 'owner';
}

export async function GET() {
  try {
    await connectToDatabase();
    const userId = await getUserId();

    const accounts = await AccountModel.find({ userId, isArchived: false }).lean();
    const netWorthSummary = computeNetWorth(accounts);

    return NextResponse.json({
      status: 'success',
      data: netWorthSummary,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi khi truy vấn danh sách tài sản';
    return NextResponse.json({ status: 'error', message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = CreateAccountSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { status: 'error', errors: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, type, currency, initialBalanceMajor, notes, ticker, quantity } = parseResult.data;
    const amountMinor = majorToMinor(initialBalanceMajor, currency);
    const userId = await getUserId();

    await connectToDatabase();

    // 1. Create Financial Account Document
    const account = await AccountModel.create({
      userId,
      name,
      type,
      currency,
      currentBalanceMinor: amountMinor,
      lastValuationAt: new Date(),
      ticker,
      quantity,
    });

    // 2. Create Initial Append-only Valuation Snapshot
    await ValuationSnapshotModel.create({
      userId,
      accountId: account._id,
      amountMinor,
      currency,
      valuationDate: new Date(),
      notes: notes || 'Khoản định giá ban đầu (Initial Creation)',
    });

    return NextResponse.json(
      {
        status: 'success',
        data: account,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi khi tạo tài sản mới';
    return NextResponse.json({ status: 'error', message }, { status: 500 });
  }
}
