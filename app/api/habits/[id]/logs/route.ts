import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

// Required for static export
export const dynamic = 'force-static';

// Required for static export with dynamic routes
export async function generateStaticParams() {
  return [];
}

interface RouteParams {
  params: {
    id: string;
  };
}

// Handler for GET /api/habits/[id]/logs
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const logs = await storage.getLogsByHabit(params.id);
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
