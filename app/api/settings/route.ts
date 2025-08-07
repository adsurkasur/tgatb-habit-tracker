import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

// Required for static export
export const dynamic = 'force-static';

// Handler for GET /api/settings
export async function GET(request: NextRequest) {
  try {
    const settings = await storage.getSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// Handler for PUT /api/settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    await storage.updateSettings(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
