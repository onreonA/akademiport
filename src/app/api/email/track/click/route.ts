/**
 * Email Click Tracking API Route
 *
 * GET /api/email/track/click?messageId=...&url=...
 * Tracks email clicks and redirects to original URL
 */

import { NextRequest, NextResponse } from 'next/server';
import { EmailAnalyticsService } from '@/5-shared/services/email';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const messageId = searchParams.get('messageId');
    const url = searchParams.get('url');

    if (!messageId || !url) {
      return NextResponse.json({ error: 'Missing messageId or url parameter' }, { status: 400 });
    }

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
