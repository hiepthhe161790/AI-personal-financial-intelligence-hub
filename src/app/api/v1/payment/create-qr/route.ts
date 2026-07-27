import { NextResponse } from 'next/server';
import { createPayOSCheckout } from '@/lib/payos';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const plan = body.plan || 'PRO_1_MONTH';

    let amount = 99000; // 99k / month
    let planName = 'Goi PRO 1 Thang';

    if (plan === 'PRO_1_YEAR') {
      amount = 899000; // 899k / year (Save 25%)
      planName = 'Goi PRO 1 Nam';
    }

    const orderCode = Math.floor(100000 + Math.random() * 900000);
    const description = `PRO ${orderCode}`;

    const checkout = await createPayOSCheckout({
      orderCode,
      amount,
      description,
      returnUrl: 'http://localhost:3000',
      cancelUrl: 'http://localhost:3000',
    });

    return NextResponse.json({
      status: 'success',
      data: {
        ...checkout,
        plan,
        planName,
      },
    });
  } catch (err: unknown) {
    console.error('Payment QR API error:', err);
    const message = err instanceof Error ? err.message : 'Lỗi khi khởi tạo mã thanh toán VietQR.';
    return NextResponse.json(
      { status: 'error', message },
      { status: 500 }
    );
  }
}
