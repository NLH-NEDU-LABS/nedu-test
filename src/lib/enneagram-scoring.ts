/**
 * @deprecated Re-export stub — will be removed in Phase 8 cleanup.
 * Import from '@/lib/enneagram-scoring' still works,
 * but prefer '@/features/enneagram/data' and '@/features/enneagram/scoring' for new code.
 */
export type { Center, EnneagramQuestion, Phase1Question, Phase2Question } from '@/features/enneagram/data';
export { ENNEAGRAM_PHASE1, ENNEAGRAM_PHASE2, LIKERT_OPTIONS } from '@/features/enneagram/data';
export { determineCenter, calculateEnneagramType } from '@/features/enneagram/scoring';
