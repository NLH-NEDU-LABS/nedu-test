/**
 * Report service — two focused endpoints.
 */
import {
  getQuizReport,
  getBaziNumerology,
  type QuizReportPayload,
  type BaziNumerologyPayload,
} from './repository';

export type { QuizReportPayload, BaziNumerologyPayload };

export async function getReport(token: string): Promise<QuizReportPayload | null> {
  return getQuizReport(token);
}

export async function getBaziNumerologyReport(
  token: string
): Promise<BaziNumerologyPayload | null> {
  return getBaziNumerology(token);
}
