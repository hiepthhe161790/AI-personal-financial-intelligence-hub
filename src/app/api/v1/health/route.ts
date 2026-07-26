import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function GET() {
  try {
    let dbStatus = 'disconnected';
    try {
      const mongoose = await connectToDatabase();
      dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'connecting';
    } catch (dbErr) {
      console.warn('MongoDB health check warning:', dbErr);
      dbStatus = 'error_connecting';
    }

    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'AI Personal Financial Intelligence Hub API',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        database: {
          status: dbStatus,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        status: 'error',
        message: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
