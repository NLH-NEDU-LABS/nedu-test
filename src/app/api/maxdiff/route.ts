import { NextResponse } from 'next/server';
import { calculateMaxDiffScores } from '@/lib/scoring';
import { PERSONAS } from '@/data/maxdiff-data';

export async function POST(request: Request) {
  try {
    const { persona_id, answers } = await request.json();
    
    if (!persona_id || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const persona = PERSONAS[persona_id];
    if (!persona) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }

    // 1. Calculate BWS Score
    const result = calculateMaxDiffScores(persona, answers);

    // 2. TBD: Save result to Database
    // API Contract placeholder: saving `result` and `answers` to DB for respondent
    
    // Simulate minor network/processing delay for the "analyzing" screen effect
    await new Promise(resolve => setTimeout(resolve, 2000));

    return NextResponse.json({
      success: true,
      result
    });
  } catch (error: any) {
    console.error('MaxDiff API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process assessment', details: error.message },
      { status: 500 }
    );
  }
}
