import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { createHabitSchema } from '@shared/schema';

// Required for static export
export const dynamic = 'force-static';

// Handler for GET /api/habits
export async function GET(request: NextRequest) {
  try {
    const habits = await storage.getHabits();
    return NextResponse.json(habits);
  } catch (error) {
    console.error('Error fetching habits:', error);
    return NextResponse.json({ error: 'Failed to fetch habits' }, { status: 500 });
  }
}

// Handler for POST /api/habits
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createHabitSchema.parse(body);
    const habit = await storage.createHabit(validatedData.name, validatedData.type);
    return NextResponse.json(habit, { status: 201 });
  } catch (error) {
    console.error('Error creating habit:', error);
    return NextResponse.json({ error: 'Invalid habit data' }, { status: 400 });
  }
}
