import { NextRequest, NextResponse } from 'next/server';
import { YouTubeApiService } from '@/infrastructure/external/youtube-api.service';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';
import { logger } from '@/shared/utils/logger';

/**
 * GET /api/trainings/[id]/videos/metadata?youtubeId=...
 * Fetch YouTube video metadata (title, description, duration)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only master_admin and consultant can fetch metadata
    if (user.role !== 'master_admin' && user.role !== 'consultant') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const youtubeId = searchParams.get('youtubeId');

    if (!youtubeId) {
      return NextResponse.json({ error: 'YouTube ID is required' }, { status: 400 });
    }

    // Check if API is available
    if (!YouTubeApiService.isAvailable()) {
      return NextResponse.json({ error: 'YouTube API key not configured' }, { status: 503 });
    }

    // Fetch metadata from YouTube API
    const metadata = await YouTubeApiService.getVideoMetadata(youtubeId);

    if (!metadata) {
      return NextResponse.json({ error: 'Video metadata not found or API error' }, { status: 404 });
    }

    return NextResponse.json({
      title: metadata.title,
      description: metadata.description || null,
      duration: metadata.duration,
      thumbnailUrl: metadata.thumbnailUrl || null,
    });
  } catch (error) {
    logger.error('Error in GET /api/trainings/[id]/videos/metadata:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
