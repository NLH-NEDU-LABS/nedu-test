import { NextResponse } from 'next/server';
import { calculate } from '@/features/bazi-numerology/service';

export async function POST(request: Request) {
  try {
    const { dob, birthTime, birthPlace, gender, fullName } = await request.json();

    if (!dob || typeof gender !== 'number' || !birthPlace) {
      return NextResponse.json(
        { error: 'Missing required fields: dob, gender, birthPlace' },
        { status: 400 }
      );
    }

    const { bazi, numerology } = calculate({ dob, birthTime, birthPlace, gender: gender as 0 | 1, fullName });

    return NextResponse.json({ success: true, bazi, numerology });
  } catch (error: any) {
    console.error('Calculation Error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate user profile', details: error.message },
      { status: 500 }
    );
  }
}
