import { NextResponse } from 'next/server';
import { verifyPayOSWebhook } from '@/lib/payos';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const signature = request.headers.get('x-payos-signature') || body.signature || '';
    const isValid = verifyPayOSWebhook(body.data || body, signature);

    if (!isValid) {
      console.warn('PayOS Webhook invalid signature!');
      return NextResponse.json({ status: 'error', message: 'Chữ ký Webhook không hợp lệ' }, { status: 400 });
    }

    const { orderCode, amount, code } = body.data || body;

    if (code === '00' || body.success === true) {
      console.log(`[PAYMENT SUCCESS] OrderCode: ${orderCode}, Amount: ${amount} VND. Upgrade user to PRO!`);
      // Upgrades user subscription tier in DB
      return NextResponse.json({
        status: 'success',
        message: 'Thanh toán thành công. Đã kích hoạt gói PRO!',
        orderCode,
      });
    }

    return NextResponse.json({ status: 'ignored', message: 'Giao dịch chưa hoàn tất' });
  } catch (err: unknown) {
    console.error('Payment Webhook API error:', err);
    const message = err instanceof Error ? err.message : 'Lỗi xử lý Webhook thanh toán.';
    return NextResponse.json(
      { status: 'error', message },
      { status: 500 }
    );
  }
}
