/**
 * Email Queue Process API Route
 *
 * POST /api/email/queue/process
 * Processes pending emails in the queue
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/4-infrastructure/database/supabase-server';

// Force dynamic rendering to avoid build-time execution
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Skip execution during build time
    if (
      process.env.NEXT_PHASE === 'phase-production-build' ||
      (process.env.NODE_ENV === 'production' && !process.env.VERCEL)
    ) {
      return NextResponse.json({ message: 'Skipped during build' }, { status: 200 });
    }

    // Check authentication - only admin
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || !['master_admin', 'program_manager'].includes(userData.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const limit = body.limit || 10;

    // Lazy import to avoid build-time execution
    const { EmailQueueService } = await import('@/5-shared/services/email');
    const queueService = new EmailQueueService();

    // Process pending emails
    const result = await queueService.processQueue(limit);

    if (result.isFailure) {
      return NextResponse.json(
        { error: 'Failed to process queue', message: result.error!.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      processed: result.value,
      message: `Processed ${result.value} emails`,
    });
  } catch (error: any) {
    console.error('Email queue process error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
