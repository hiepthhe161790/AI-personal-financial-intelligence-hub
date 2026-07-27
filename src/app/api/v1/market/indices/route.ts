import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
    
    // Call the Python Sidecar
    const res = await fetch(`${pythonServiceUrl}/api/v1/market/indices`, {
      next: { revalidate: 30 }, // cache for 30 seconds
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.warn('Python Sidecar indices unreachable. Using Node.js fallback.', error);
  }

  // Fallback if Python sidecar is down
  return NextResponse.json({
    status: 'success',
    source: 'Node.js Local Fallback',
    updatedAt: new Date().toISOString(),
    indices: [
      {
        name: 'VN-INDEX',
        value: 1254.32,
        change: '+0.25%',
        direction: 'UP',
        exchange: 'HOSE',
      },
      {
        name: 'HNX-INDEX',
        value: 236.15,
        change: '-0.12%',
        direction: 'DOWN',
        exchange: 'HNX',
      },
      {
        name: 'UPCoM-INDEX',
        value: 92.45,
        change: '+0.05%',
        direction: 'UP',
        exchange: 'HNX',
      },
    ],
  });
}
