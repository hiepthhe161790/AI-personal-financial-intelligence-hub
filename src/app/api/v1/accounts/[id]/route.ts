import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/db';
import AccountModel from '@/models/Account';
import ValuationSnapshotModel from '@/models/ValuationSnapshot';
import { majorToMinor } from '@/domain/money';
import { getUserIdFromSession } from '@/lib/auth';

const EditAccountSchema = z.object({
  name: z.string().min(1, 'Tên tài sản không được để trống'),
  type: z.enum(['CASH', 'BANK', 'SAVINGS', 'GOLD', 'STOCK', 'FUND', 'CRYPTO', 'OTHER_ASSET', 'LIABILITY']),
  currency: z.string().default('VND'),
  currentBalanceMajor: z.number().min(0, 'Số dư không được nhỏ hơn 0'),
  notes: z.string().optional(),
  ticker: z.string().optional(),
  quantity: z.number().min(0).optional(),
  costBasisMajor: z.number().min(0).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const userId = await getUserIdFromSession();
    const body = await request.json();

    const parseResult = EditAccountSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { status: 'error', errors: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      name,
      type,
      currency,
      currentBalanceMajor,
      notes,
      ticker,
      quantity,
      costBasisMajor,
    } = parseResult.data;

    const amountMinor = majorToMinor(currentBalanceMajor, currency);

    // 1. Fetch old account details to check if balance changed
    const account = await AccountModel.findOne({ _id: id, userId });
    if (!account) {
      return NextResponse.json(
        { status: 'error', message: 'Không tìm thấy tài khoản để chỉnh sửa' },
        { status: 404 }
      );
    }

    const balanceChanged = account.currentBalanceMinor !== amountMinor;

    // 2. Update account fields
    account.name = name;
    account.type = type;
    account.currency = currency;
    account.currentBalanceMinor = amountMinor;
    account.ticker = (type === 'GOLD' || type === 'STOCK') ? ticker?.trim().toUpperCase() : undefined;
    account.quantity = (type === 'GOLD' || type === 'STOCK') ? quantity : undefined;
    account.costBasisMinor = (['STOCK', 'CRYPTO', 'FUND', 'GOLD'].includes(type) && costBasisMajor)
      ? majorToMinor(costBasisMajor, currency)
      : undefined;
    account.lastValuationAt = new Date();

    await account.save();

    // 3. Create Valuation Snapshot if balance changed
    if (balanceChanged) {
      await ValuationSnapshotModel.create({
        userId,
        accountId: account._id,
        amountMinor,
        currency,
        valuationDate: new Date(),
        notes: notes || 'Cập nhật số dư qua chỉnh sửa tài sản',
      });
    }

    return NextResponse.json({
      status: 'success',
      data: account,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi khi chỉnh sửa tài sản';
    return NextResponse.json({ status: 'error', message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const userId = await getUserIdFromSession();

    // Soft delete by setting isArchived: true
    const account = await AccountModel.findOneAndUpdate(
      { _id: id, userId },
      { isArchived: true },
      { new: true }
    );

    if (!account) {
      return NextResponse.json(
        { status: 'error', message: 'Không tìm thấy tài khoản để xóa' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 'success',
      data: account,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi khi xóa tài sản';
    return NextResponse.json({ status: 'error', message }, { status: 500 });
  }
}
