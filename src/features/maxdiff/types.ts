// MaxDiff Assessment Types
// Moved from src/types/assessment.ts

export interface Problem {
  id: string;
  label: string;
  description: string;
}

export interface MaxDiffSet {
  set_id: string;
  set_label: string;
  items: string[];
}

export interface CourseMapping {
  triggered_by: string[];
  problem_theme: string;
  recommended_course: string;
  course_type: string;
  cta: string;
  urgency_message: string;
}

export interface Persona {
  id: string;
  label: string;
  emoji: string;
  color: string;
  maxdiff_instruction: string;
  most_label?: string;
  least_label?: string;
  problem_pool: Problem[];
  sets: MaxDiffSet[];
  course_mapping: CourseMapping[];
}

export interface PersonaRoute {
  label: string;
  persona_id: string;
  emoji: string;
}

export interface SetAnswer {
  set_id: string;
  most: string;
  least: string;
}

export interface ScoredItem {
  item_id: string;
  label: string;
  description: string;
  most_count: number;
  least_count: number;
  raw_score: number;
  normalized: number;
  emoji?: string;
}

export interface CourseRecommendation {
  primary_course_id: string;
  primary_course_name: string;
  primary_course_url: string;
  backup_course_id: string;
  backup_course_name: string;
  backup_course_url: string;
  why_fits: string;
  learning_style_note: string;
  urgency_message: string;
  confidence_score: number;
}

export interface AssessmentResult {
  persona_id: string;
  persona_label: string;
  scores: ScoredItem[];
  top_problems: ScoredItem[];
  recommended_courses?: CourseMapping[];
  ai_recommendation?: CourseRecommendation;
}
