import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendEmail } from '@/lib/email-sequence/send-email'
import { notifyTelegram } from '@/lib/email-sequence/notify-telegram'
import type { Lead } from '@/lib/email-sequence/types'

export async function GET(request: NextRequest) {
  // 1. Verify CRON_SECRET
  const authHeader = request.headers.get('authorization')
  const expectedToken = process.env.CRON_SECRET

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 2. Query Supabase RPC
    const { data: leads, error: rpcError } = await supabase.rpc('get_leads_by_day')

    if (rpcError) {
      console.error('RPC get_leads_by_day error:', rpcError)
      return NextResponse.json({ error: 'Failed to fetch leads', detail: rpcError.message }, { status: 500 })
    }

    if (!leads || leads.length === 0) {
      return NextResponse.json({ success: true, sent: 0, day_breakdown: {}, message: 'No leads to process today' })
    }

    // 3. Loop and send emails
    let sent = 0
    const dayBreakdown: Record<number, number> = {}
    const errors: { lead_id: string; day: number; error: string }[] = []

    for (const lead of leads as Lead[]) {
      try {
        // a. Send email for this day
        await sendEmail(lead, lead.day_number)

        // b. Day 16: also notify Telegram
        if (lead.day_number === 16) {
          await notifyTelegram(lead)
        }

        sent++
        dayBreakdown[lead.day_number] = (dayBreakdown[lead.day_number] || 0) + 1
      } catch (err: any) {
        console.error(`Error processing lead ${lead.id} (day ${lead.day_number}):`, err)
        errors.push({ lead_id: lead.id, day: lead.day_number, error: err.message || 'Unknown error' })
      }

      // c. Delay 500ms between leads (Resend rate limit)
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // 4. Return summary
    return NextResponse.json({
      success: true,
      sent,
      total: leads.length,
      day_breakdown: dayBreakdown,
      ...(errors.length > 0 && { errors }),
    })
  } catch (err: any) {
    console.error('Email sequence cron failed:', err)
    return NextResponse.json({ error: 'Internal server error', detail: err.message }, { status: 500 })
  }
}
