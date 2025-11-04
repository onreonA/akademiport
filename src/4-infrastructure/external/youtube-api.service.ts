/**
 * YouTube API Service
 *
 * Provides YouTube Data API v3 integration for fetching video metadata
 * (duration, title, description, thumbnail)
 */

export interface VideoMetadata {
  duration: number; // seconds
  title: string;
  description?: string;
  thumbnailUrl?: string;
}

export interface YouTubeApiResponse {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      description: string;
      thumbnails: {
        default?: { url: string };
        medium?: { url: string };
        high?: { url: string };
      };
    };
    contentDetails: {
      duration: string; // ISO 8601 format: PT1H2M10S
    };
  }>;
}

export class YouTubeApiService {
  private static readonly API_BASE_URL = 'https://www.googleapis.com/youtube/v3';
  private static readonly API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

  /**
   * Check if YouTube API is available
   */
  static isAvailable(): boolean {
    return !!this.API_KEY;
  }

  /**
   * Get video metadata from YouTube API
   */
  static async getVideoMetadata(youtubeId: string): Promise<VideoMetadata | null> {
    // Check if API key is available
    if (!this.API_KEY) {
      console.warn('YouTube API key not configured. Video metadata will not be fetched.');
      return null;
    }

    if (!youtubeId) {
      console.warn('YouTube ID is required to fetch metadata.');
      return null;
    }

    try {
      const url = `${this.API_BASE_URL}/videos?id=${youtubeId}&part=snippet,contentDetails&key=${this.API_KEY}`;

      const response = await fetch(url);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        console.error('YouTube API error:', error);
        return null;
      }

      const data: YouTubeApiResponse = await response.json();

      if (!data.items || data.items.length === 0) {
        console.warn(`No video found with ID: ${youtubeId}`);
        return null;
      }

      const video = data.items[0];
      const snippet = video.snippet;
      const contentDetails = video.contentDetails;

      // Parse duration from ISO 8601 format (PT1H2M10S) to seconds
      const duration = this.parseDuration(contentDetails.duration);

      // Get thumbnail URL (prefer high quality, fallback to medium, then default)
      const thumbnailUrl =
        snippet.thumbnails.high?.url ||
        snippet.thumbnails.medium?.url ||
        snippet.thumbnails.default?.url;

      return {
        duration,
        title: snippet.title,
        description: snippet.description,
        thumbnailUrl,
      };
    } catch (error) {
      console.error('Error fetching YouTube video metadata:', error);
      return null;
    }
  }

  /**
   * Parse ISO 8601 duration format to seconds
   * Examples: PT1H2M10S = 3730 seconds, PT5M30S = 330 seconds, PT10S = 10 seconds
   */
  private static parseDuration(isoDuration: string): number {
    if (!isoDuration || !isoDuration.startsWith('PT')) {
      return 0;
    }

    const duration = isoDuration.substring(2); // Remove 'PT' prefix
    let totalSeconds = 0;

    // Match hours: PT(\d+)H
    const hoursMatch = duration.match(/(\d+)H/);
    if (hoursMatch) {
      totalSeconds += parseInt(hoursMatch[1], 10) * 3600;
    }

    // Match minutes: PT(\d+)M
    const minutesMatch = duration.match(/(\d+)M/);
    if (minutesMatch) {
      totalSeconds += parseInt(minutesMatch[1], 10) * 60;
    }

    // Match seconds: PT(\d+)S
    const secondsMatch = duration.match(/(\d+)S/);
    if (secondsMatch) {
      totalSeconds += parseInt(secondsMatch[1], 10);
    }

    return totalSeconds;
  }

  /**
   * Extract YouTube video ID from URL
   */
  static extractYouTubeId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }
}
