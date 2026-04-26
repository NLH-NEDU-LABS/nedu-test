import { intakeClient } from '@/lib/nedu-intake/client';
import type { Lead } from '@/features/email-sequence/types';

export async function getLeadsByDay(): Promise<Lead[]> {
  const items = await intakeClient.getEmailQueue();
  return items as Lead[];
}
