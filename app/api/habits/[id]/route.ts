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

// Handler for DELETE /api/habits/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await storage.deleteHabit(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting habit:', error);
    return NextResponse.json({ error: 'Failed to delete habit' }, { status: 500 });
  }
}
