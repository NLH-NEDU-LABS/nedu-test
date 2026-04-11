/**
 * Email sequence service — processSequence().
 *
 * Key improvement over the original cron route:
 * Replaces sequential loop (500ms/lead) with batched Promise.allSettled.
 * 5 concurrent sends per batch, 500ms between batches.
 *
 * 100 leads: ~50s (sequential) → ~10s (batched)
 */
import { getLeadsByDay } from './repository';
import type { Lead } from './types';
import { sendEmail as sendSequenceEmail } from '@/lib/email-sequence/send-email';
import { notifyTelegram } from '@/lib/telegram/client';

const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 500;

export interface ProcessSequenceResult {
  sent: number;
  total: number;
  day_breakdown: Record<number, number>;
  errors?: { lead_id: string; day: number; error: string }[];
}

/**
 * Fetch today's leads and send emails in parallel batches.
 */
export async function processSequence(): Promise<ProcessSequenceResult> {
  const leads = await getLeadsByDay();

  if (leads.length === 0) {
    return { sent: 0, total: 0, day_breakdown: {} };
  }

  let sent = 0;
  const dayBreakdown: Record<number, number> = {};
  const errors: { lead_id: string; day: number; error: string }[] = [];

  // Process in batches of BATCH_SIZE
  for (let i = 0; i < leads.length; i += BATCH_SIZE) {
    const batch = leads.slice(i, i + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map((lead: Lead) => processSingleLead(lead))
    );

    results.forEach((result, idx) => {
      const lead = batch[idx];
      if (result.status === 'fulfilled') {
        sent++;
        dayBreakdown[lead.day_number] = (dayBreakdown[lead.day_number] || 0) + 1;
      } else {
        errors.push({
          lead_id: lead.id,
          day: lead.day_number,
          error: result.reason?.message || 'Unknown error',
        });
      }
    });

    // Delay between batches (skip after last batch)
    if (i + BATCH_SIZE < leads.length) {
      await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }

  return {
    sent,
    total: leads.length,
    day_breakdown: dayBreakdown,
    ...(errors.length > 0 && { errors }),
  };
}

async function processSingleLead(lead: Lead): Promise<void> {
  await sendSequenceEmail(lead, lead.day_number);

  if (lead.day_number === 16) {
    await notifyTelegram(lead);
  }
}
