import { NextResponse } from 'next/server';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

export async function GET() {
  try {
    const res = await fetch(`${PYTHON_SERVICE_URL}/api/v1/market/crypto`, {
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.warn('Python Analytics Service offline, returning crypto fallback:', error);
  }

  // Gateway Fallback
  return NextResponse.json({
    status: 'success',
    source: 'Gateway Fallback Crypto Quotes',
    crypto: {
      bitcoin: { usd: 64500, vnd: 1638300000 },
      ethereum: { usd: 3450, vnd: 87630000 },
      tether: { usd: 1.0, vnd: 25400 },
      solana: { usd: 145, vnd: 3683000 },
      binancecoin: { usd: 580, vnd: 14732000 },
    },
  });
}
