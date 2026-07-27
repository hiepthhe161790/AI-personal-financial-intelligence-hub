import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/db';
import WealthGoalModel from '@/models/WealthGoal';
import { majorToMinor } from '@/domain/money';
import { authOptions } from '@/lib/auth';

const UpdateGoalSchema = z.object({
  name: z.string().min(1).optional(),
  targetAmountMajor: z.number().min(0.01).optional(),
  currentAmountMajor: z.number().min(0).optional(),
  targetDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
});

async function getUserId() {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string })?.id || 'owner';
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const goalId = params.id;
    const body = await request.json();
    const parseResult = UpdateGoalSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { status: 'error', errors: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const userId = await getUserId();
    await connectToDatabase();

    const goal = await WealthGoalModel.findOne({ _id: goalId, userId });
    if (!goal) {
      return NextResponse.json(
        { status: 'error', message: 'Mục tiêu tài chính không tồn tại hoặc không thuộc quyền sở hữu của bạn' },
        { status: 404 }
      );
    }

    const { name, targetAmountMajor, currentAmountMajor, targetDate } = parseResult.data;

    if (name !== undefined) goal.name = name;
    if (targetAmountMajor !== undefined) goal.targetAmountMinor = majorToMinor(targetAmountMajor, 'VND');
    if (currentAmountMajor !== undefined) goal.currentAmountMinor = majorToMinor(currentAmountMajor, 'VND');
    if (targetDate !== undefined) goal.targetDate = targetDate;

    await goal.save();

    return NextResponse.json({
      status: 'success',
      data: goal,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi khi cập nhật mục tiêu tài chính';
    return NextResponse.json({ status: 'error', message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const goalId = params.id;
    const userId = await getUserId();

    await connectToDatabase();

    const result = await WealthGoalModel.deleteOne({ _id: goalId, userId });
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { status: 'error', message: 'Mục tiêu tài chính không tồn tại hoặc không thuộc quyền sở hữu của bạn' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 'success',
      message: 'Đã xóa mục tiêu tài chính thành công',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi khi xóa mục tiêu tài chính';
    return NextResponse.json({ status: 'error', message }, { status: 500 });
  }
}
