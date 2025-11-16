/**
 * Email Open Tracking API Route
 *
 * GET /api/email/track/open?messageId=...
 * Tracks email opens via SendGrid webhook or pixel
 */

import { NextRequest, NextResponse } from 'next/server';
import { EmailAnalyticsService } from '@/5-shared/services/email';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const messageId = searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json({ error: 'Missing messageId parameter' }, { status: 400 });
    }

    const analyticsService = new EmailAnalyticsService();
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');

    const result = await analyticsService.trackOpen(
      messageId,
      ip || undefined,
      userAgent || undefined
    );

    if (result.isFailure) {
      return NextResponse.json(
        { error: 'Failed to track open', message: result.error!.message },
        { status: 500 }
      );
    }

    // Return 1x1 transparent pixel
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

    return new NextResponse(pixel, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Email open tracking error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
