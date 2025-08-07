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

// Handler for POST /api/habits/[id]/track
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();
    const { completed } = body;
    const log = await storage.createLog(params.id, completed);
    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error('Error tracking habit:', error);
    return NextResponse.json({ error: 'Failed to track habit' }, { status: 500 });
  }
}
