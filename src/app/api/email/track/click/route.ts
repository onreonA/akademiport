/**
 * Email Click Tracking API Route
 *
 * GET /api/email/track/click?messageId=...&url=...
 * Tracks email clicks and redirects to original URL
 */

import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering to avoid build-time execution
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Skip execution during build time
    if (
      process.env.NEXT_PHASE === 'phase-production-build' ||
      (process.env.NODE_ENV === 'production' && !process.env.VERCEL)
    ) {
      return NextResponse.redirect('https://example.com'); // Dummy redirect during build
    }

    const searchParams = request.nextUrl.searchParams;
    const messageId = searchParams.get('messageId');
    const url = searchParams.get('url');

    if (!messageId || !url) {
      return NextResponse.json({ error: 'Missing messageId or url parameter' }, { status: 400 });
    }

    // Lazy import to avoid build-time execution
    const { EmailAnalyticsService } = await import('@/5-shared/services/email');
    const analyticsService = new EmailAnalyticsService();
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');

    const result = await analyticsService.trackClick(
      messageId,
      decodeURIComponent(url),
      ip || undefined,
      userAgent || undefined
    );

    if (result.isFailure) {
      // Still redirect even if tracking fails
      console.error('Email click tracking error:', result.error);
    }

    // Redirect to original URL
    return NextResponse.redirect(decodeURIComponent(url));
  } catch (error: any) {
    console.error('Email click tracking error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
