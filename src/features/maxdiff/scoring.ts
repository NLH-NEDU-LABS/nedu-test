/**
 * MaxDiff scoring engine — pure function, no side effects.
 * Moved from src/lib/scoring.ts
 *
 * Algorithm:
 *  1. Count most/least selections per item across all sets
 *  2. BWS score = (most - least) / appearances
 *  3. Normalize to 0-100
 *  4. Sort DESC, top 2 = primary problems
 *  5. Map to course recommendations
 *  Tie-breaking: higher most_count wins
 */
import type { Persona, SetAnswer, ScoredItem, AssessmentResult, CourseMapping } from './types';

export function calculateMaxDiffScores(
  persona: Persona,
  answers: SetAnswer[]
): AssessmentResult {
  // Step 1: Count appearances, most, least per item
  const stats: Record<string, { most: number; least: number; appearances: number }> = {};

  for (const problem of persona.problem_pool) {
    stats[problem.id] = { most: 0, least: 0, appearances: 0 };
  }

  for (const set of persona.sets) {
    for (const itemId of set.items) {
      if (stats[itemId]) stats[itemId].appearances += 1;
    }
  }

  for (const answer of answers) {
    if (stats[answer.most]) stats[answer.most].most += 1;
    if (stats[answer.least]) stats[answer.least].least += 1;
  }

  // Step 2: BWS scores
  const rawScores: { item_id: string; bws: number; most_count: number; least_count: number }[] = [];
  for (const [item_id, s] of Object.entries(stats)) {
    const apps = s.appearances || 1;
    rawScores.push({
      item_id,
      bws: (s.most - s.least) / apps,
      most_count: s.most,
      least_count: s.least,
    });
  }

  // Step 3: Rescale to 0-100
  const minBws = Math.min(...rawScores.map((s) => s.bws));
  const maxBws = Math.max(...rawScores.map((s) => s.bws));
  const range = maxBws - minBws;

  const scoredItems: ScoredItem[] = rawScores.map((s) => {
    const problem = persona.problem_pool.find((p) => p.id === s.item_id)!;
    const rescaled = range > 0 ? ((s.bws - minBws) / range) * 100 : 0;
    return {
      item_id: s.item_id,
      label: problem.label,
      description: problem.description,
      most_count: s.most_count,
      least_count: s.least_count,
      raw_score: s.bws,
      normalized: rescaled,
    };
  });

  // Step 4: Sort DESC
  scoredItems.sort((a, b) => {
    if (b.normalized !== a.normalized) return b.normalized - a.normalized;
    return b.most_count - a.most_count;
  });

  // Step 5: Top 2 problems → course mapping
  const topProblems = scoredItems.slice(0, 2);
  const topProblemIds = topProblems.map((p) => p.item_id);
  const matchedCourses: CourseMapping[] = [];

  for (const mapping of persona.course_mapping) {
    const hasMatch = mapping.triggered_by.some((id) => topProblemIds.includes(id));
    if (hasMatch) matchedCourses.push(mapping);
  }

  const recommendedCourses =
    matchedCourses.length > 0 ? matchedCourses : [persona.course_mapping[0]];

  return {
    persona_id: persona.id,
    persona_label: persona.label,
    scores: scoredItems,
    top_problems: topProblems,
    recommended_courses: recommendedCourses,
  };
}
