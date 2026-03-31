import { NextResponse } from 'next/server';
import { calculateFullNumerology } from '@/lib/numerology';
import { buildBazi, getSolarTime } from '@/lib/bazi';
import { getTimezoneForLocation } from '@/lib/timezone';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dob, birthTime, birthPlace, gender, fullName } = body;

    // Validate request
    if (!dob || typeof gender !== 'number' || !birthPlace) {
      return NextResponse.json(
        { error: 'Missing required fields: dob, gender, birthPlace' },
        { status: 400 }
      );
    }

    // Determine timezone offset string from birthplace string
    const tz = getTimezoneForLocation(birthPlace);
    
    // Fallback hour to noon if not provided
    const timeToUse = birthTime || '12:00';
    const isoString = `${dob}T${timeToUse}:00${tz}`;

    // 1. Calculate Bazi (local)
    const solarTime = getSolarTime(isoString, tz);
    const baziData = buildBazi({
      solarTime,
      gender: gender as 0 | 1,
      eightCharProviderSect: 2
    });

    // 2. Calculate Numerology (local - ported from Python backend)
    const numerologyData = calculateFullNumerology(dob, fullName);

    return NextResponse.json({
      success: true,
      bazi: baziData,
      numerology: numerologyData
    });
    
  } catch (error: any) {
    console.error('Calculation Error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate user profile', details: error.message },
      { status: 500 }
    );
  }
}
