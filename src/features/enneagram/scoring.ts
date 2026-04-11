/**
 * Enneagram scoring functions — pure, no side effects.
 * Moved from src/lib/enneagram-scoring.ts
 */
import type { Center } from './data';
import { ENNEAGRAM_PHASE1, ENNEAGRAM_PHASE2 } from './data';

export function determineCenter(answers: Record<string, string>): Center {
  const score: Record<Center, number> = { gut: 0, heart: 0, head: 0 };

  for (const q of ENNEAGRAM_PHASE1) {
    const val = parseInt(answers[q.id] ?? '0');
    score[q.center] += val;
  }

  // Highest total wins; tie → gut > heart > head (arbitrary but consistent)
  return Object.entries(score).sort((a, b) => b[1] - a[1])[0][0] as Center;
}

export function calculateEnneagramType(
  center: Center,
  phase2Answers: Record<string, string>
): number {
  const score: Record<number, number> = {};

  for (const q of ENNEAGRAM_PHASE2[center]) {
    if (!score[q.type]) score[q.type] = 0;
    score[q.type] += parseInt(phase2Answers[q.id] ?? '0');
  }

  return Number(Object.entries(score).sort((a, b) => b[1] - a[1])[0][0]);
}
