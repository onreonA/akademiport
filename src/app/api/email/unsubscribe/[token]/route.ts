/**
 * Email Unsubscribe API Route
 *
 * GET /api/email/unsubscribe/[token]
 * Handles email unsubscribe requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/4-infrastructure/database/supabase-server';

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    // Find email preferences by token
    const { data: preferences, error } = await supabase
      .from('email_preferences')
      .select('*')
      .eq('unsubscribe_token', token)
      .single();

    if (error || !preferences) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 });
    }

    // Update preferences to unsubscribe
    const { error: updateError } = await supabase
      .from('email_preferences')
      .update({
        unsubscribed_at: new Date().toISOString(),
        receive_marketing: false,
        receive_notifications: false,
        receive_appointment_reminders: false,
        receive_event_reminders: false,
        receive_task_reminders: false,
        receive_forum_notifications: false,
        receive_report_notifications: false,
      })
      .eq('id', preferences.id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to unsubscribe', message: updateError.message },
        { status: 500 }
      );
    }

    // Return success page HTML
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Abonelik İptal Edildi</title>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 50px auto;
              padding: 20px;
              text-align: center;
            }
            h1 { color: #333; }
            p { color: #666; }
          </style>
        </head>
        <body>
          <h1>Abonelik İptal Edildi</h1>
          <p>Email aboneliğiniz başarıyla iptal edildi.</p>
          <p>Artık pazarlama ve bildirim email'leri göndermeyeceğiz.</p>
          <p>İşlemsel email'ler (şifre sıfırlama, kayıt vb.) gönderilmeye devam edecektir.</p>
        </body>
      </html>
    `,
      {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      }
    );
  } catch (error: any) {
    console.error('Email unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
