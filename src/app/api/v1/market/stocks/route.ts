import { NextResponse } from 'next/server';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbols = searchParams.get('symbols') || 'HPG,FPT,MBB,TCB,SSI,VIC';

  try {
    const res = await fetch(`${PYTHON_SERVICE_URL}/api/v1/market/stocks?symbols=${encodeURIComponent(symbols)}`, {
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.warn('Python Analytics Service offline, returning stock quotes fallback:', error);
  }

  // Gateway Fallback
  return NextResponse.json({
    status: 'success',
    source: 'Gateway Fallback Quotes',
    stocks: [
      { symbol: 'HPG', name: 'Tập đoàn Hòa Phát', priceVND: 28500, changePercent: '+1.2%', exchange: 'HOSE' },
      { symbol: 'FPT', name: 'Tập đoàn FPT', priceVND: 132000, changePercent: '+2.5%', exchange: 'HOSE' },
      { symbol: 'MBB', name: 'Ngân hàng MB', priceVND: 24800, changePercent: '+0.8%', exchange: 'HOSE' },
      { symbol: 'TCB', name: 'Ngân hàng Techcombank', priceVND: 23500, changePercent: '-0.4%', exchange: 'HOSE' },
      { symbol: 'SSI', name: 'Chứng khoán SSI', priceVND: 31200, changePercent: '+1.5%', exchange: 'HOSE' },
      { symbol: 'VIC', name: 'Tập đoàn Vingroup', priceVND: 42100, changePercent: '+0.0%', exchange: 'HOSE' },
    ],
  });
}
