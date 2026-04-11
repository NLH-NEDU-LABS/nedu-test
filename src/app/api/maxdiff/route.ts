import { NextResponse } from 'next/server';
import { score } from '@/features/maxdiff/service';

export async function POST(request: Request) {
  try {
    const { persona_id, answers } = await request.json();

    if (!persona_id || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const result = score({ persona_id, answers });

    // Simulate processing delay for the "analyzing" screen effect
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('MaxDiff API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process assessment', details: error.message },
      { status: 500 }
    );
  }
}
