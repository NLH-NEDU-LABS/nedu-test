/**
 * MBTI scoring function — pure, no side effects.
 * Moved from src/lib/mbti-scoring.ts
 */
import { MBTI_ANSWER_MAP } from './data';

export function calculateMBTI(answers: Record<string, string>): string {
  const score = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

  Object.entries(answers).forEach(([q, ans]) => {
    const letter = MBTI_ANSWER_MAP[q]?.[ans];
    if (letter) score[letter as keyof typeof score]++;
  });

  // Tie (4-4) → return negative pole (slight lean)
  return [
    score.E > score.I ? 'E' : 'I',
    score.S > score.N ? 'S' : 'N',
    score.T > score.F ? 'T' : 'F',
    score.J > score.P ? 'J' : 'P',
  ].join('');
}
