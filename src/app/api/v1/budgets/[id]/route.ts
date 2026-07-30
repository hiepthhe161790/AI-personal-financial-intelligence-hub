import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import BudgetModel from '@/models/Budget';
import { getUserIdFromSession } from '@/lib/auth';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const userId = await getUserIdFromSession();

    const deleted = await BudgetModel.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      return NextResponse.json(
        { status: 'error', message: 'Không tìm thấy ngân sách.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 'success',
      message: 'Đã xóa ngân sách thành công.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi khi xóa ngân sách';
    return NextResponse.json({ status: 'error', message }, { status: 500 });
  }
}
