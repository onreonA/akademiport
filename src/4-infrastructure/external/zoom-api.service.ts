/**
 * Zoom API Service
 *
 * Provides Zoom Meeting API integration for creating and managing meetings
 * Used by both Event and Appointment modules
 */

import { logger } from '@/shared/utils/logger';

export interface ZoomMeetingConfig {
  topic: string;
  type?: 1 | 2 | 3 | 8; // 1=Instant, 2=Scheduled, 3=Recurring, 8=RecurringNoFixedTime
  startTime?: string; // ISO 8601 format
  duration?: number; // minutes
  timezone?: string;
  password?: string;
  agenda?: string;
  settings?: {
    hostVideo?: boolean;
    participantVideo?: boolean;
    joinBeforeHost?: boolean;
    muteUponEntry?: boolean;
    waitingRoom?: boolean;
    autoRecording?: 'local' | 'cloud' | 'none';
  };
  recurrence?: {
    type: 1 | 2 | 3; // 1=Daily, 2=Weekly, 3=Monthly
    repeatInterval?: number;
    weeklyDays?: string; // 1-7, comma separated
    monthlyDay?: number; // 1-31
    endTimes?: number; // Number of occurrences
    endDateTime?: string; // ISO 8601 format
  };
}

export interface ZoomMeeting {
  id: string;
  uuid: string;
  hostId: string;
  hostEmail: string;
  topic: string;
  type: number;
  status: 'waiting' | 'started' | 'finished';
  startTime: string;
  duration: number;
  timezone: string;
  createdAt: string;
  startUrl: string; // Host start URL
  joinUrl: string; // Participant join URL
  password?: string;
  agenda?: string;
  settings: {
    hostVideo: boolean;
    participantVideo: boolean;
    joinBeforeHost: boolean;
    muteUponEntry: boolean;
    waitingRoom: boolean;
    autoRecording: string;
  };
}

export interface ZoomApiError {
  code: number;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

export class ZoomApiService {
  private static readonly API_BASE_URL = 'https://api.zoom.us/v2';
  private static readonly ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID;
  private static readonly CLIENT_ID = process.env.ZOOM_CLIENT_ID;
  private static readonly CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;

  /**
   * Check if Zoom API is configured
   */
  static isAvailable(): boolean {
    return !!(this.ACCOUNT_ID && this.CLIENT_ID && this.CLIENT_SECRET);
  }

  /**
   * Get OAuth access token
   */
  private static async getAccessToken(): Promise<string | null> {
    if (!this.isAvailable()) {
      logger.warn('Zoom API credentials not configured.');
      return null;
    }

    try {
      const credentials = Buffer.from(`${this.CLIENT_ID}:${this.CLIENT_SECRET}`).toString('base64');
      const response = await fetch(
        `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${this.ACCOUNT_ID}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${credentials}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        logger.error('Zoom OAuth error:', {
          status: response.status,
          error: error.error || error.message || 'Unknown error',
        });
        return null;
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      logger.error('Error getting Zoom access token:', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Create a Zoom meeting
   */
  static async createMeeting(config: ZoomMeetingConfig): Promise<ZoomMeeting | null> {
    if (!this.isAvailable()) {
      logger.warn('Zoom API not available. Meeting will not be created.');
      return null;
    }

    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      return null;
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/users/me/meetings`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: config.topic,
          type: config.type ?? 2, // Default: Scheduled meeting
          start_time: config.startTime,
          duration: config.duration ?? 60, // Default: 60 minutes
          timezone: config.timezone ?? 'Europe/Istanbul',
          password: config.password,
          agenda: config.agenda,
          settings: {
            host_video: config.settings?.hostVideo ?? true,
            participant_video: config.settings?.participantVideo ?? true,
            join_before_host: config.settings?.joinBeforeHost ?? false,
            mute_upon_entry: config.settings?.muteUponEntry ?? false,
            waiting_room: config.settings?.waitingRoom ?? true,
            auto_recording: config.settings?.autoRecording ?? 'none',
            ...config.settings,
          },
          recurrence: config.recurrence,
        }),
      });

      if (!response.ok) {
        const error: ZoomApiError = await response.json().catch(() => ({
          code: response.status,
          message: 'Unknown error',
        }));

        // Log detailed error information
        logger.error('Zoom API error creating meeting:', {
          status: response.status,
          statusText: response.statusText,
          errorCode: error.code,
          errorMessage: error.message,
          config: {
            topic: config.topic,
            startTime: config.startTime,
            duration: config.duration,
          },
        });

        // Provide more specific error messages
        let errorMessage = 'Zoom meeting oluşturulamadı';
        if (response.status === 401) {
          errorMessage = "Zoom API kimlik doğrulama hatası. Lütfen credentials'ları kontrol edin.";
        } else if (response.status === 403) {
          errorMessage = 'Zoom API yetkilendirme hatası. Gerekli izinler kontrol edilmeli.';
        } else if (response.status === 429) {
          errorMessage = 'Zoom API rate limit aşıldı. Lütfen daha sonra tekrar deneyin.';
        } else if (error.message) {
          errorMessage = `Zoom API hatası: ${error.message}`;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      return this.mapToZoomMeeting(data);
    } catch (error) {
      // If error is already an Error with message, re-throw it
      if (error instanceof Error) {
        logger.error('Error creating Zoom meeting:', {
          error: error.message,
          stack: error.stack,
        });
        throw error;
      }

      // Otherwise, wrap in Error
      logger.error('Unexpected error creating Zoom meeting:', error);
      throw new Error('Zoom meeting oluşturulurken beklenmeyen bir hata oluştu');
    }
  }

  /**
   * Update a Zoom meeting
   */
  static async updateMeeting(
    meetingId: string,
    config: Partial<ZoomMeetingConfig>
  ): Promise<ZoomMeeting | null> {
    if (!this.isAvailable()) {
      logger.warn('Zoom API not available.');
      return null;
    }

    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      return null;
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/meetings/${meetingId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: config.topic,
          type: config.type,
          start_time: config.startTime,
          duration: config.duration,
          timezone: config.timezone,
          password: config.password,
          agenda: config.agenda,
          settings: config.settings,
        }),
      });

      if (!response.ok) {
        const error: ZoomApiError = await response.json().catch(() => ({
          code: response.status,
          message: 'Unknown error',
        }));

        logger.error('Zoom API error updating meeting:', {
          meetingId,
          status: response.status,
          errorCode: error.code,
          errorMessage: error.message,
        });

        let errorMessage = 'Zoom meeting güncellenemedi';
        if (response.status === 404) {
          errorMessage = 'Zoom meeting bulunamadı. Meeting ID kontrol edilmeli.';
        } else if (error.message) {
          errorMessage = `Zoom API hatası: ${error.message}`;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      return this.mapToZoomMeeting(data);
    } catch (error) {
      if (error instanceof Error) {
        logger.error('Error updating Zoom meeting:', {
          meetingId,
          error: error.message,
          stack: error.stack,
        });
        throw error;
      }

      logger.error('Unexpected error updating Zoom meeting:', error);
      throw new Error('Zoom meeting güncellenirken beklenmeyen bir hata oluştu');
    }
  }

  /**
   * Delete a Zoom meeting
   */
  static async deleteMeeting(meetingId: string): Promise<boolean> {
    if (!this.isAvailable()) {
      logger.warn('Zoom API not available.');
      return false;
    }

    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      return false;
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/meetings/${meetingId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const error: ZoomApiError = await response.json().catch(() => ({
          code: response.status,
          message: 'Unknown error',
        }));

        logger.error('Zoom API error deleting meeting:', {
          meetingId,
          status: response.status,
          errorCode: error.code,
          errorMessage: error.message,
        });

        // For delete, we return false instead of throwing
        // because meeting might already be deleted
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error deleting Zoom meeting:', {
        meetingId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Get a Zoom meeting
   */
  static async getMeeting(meetingId: string): Promise<ZoomMeeting | null> {
    if (!this.isAvailable()) {
      logger.warn('Zoom API not available.');
      return null;
    }

    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      return null;
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/meetings/${meetingId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const error: ZoomApiError = await response.json().catch(() => ({
          code: response.status,
          message: 'Unknown error',
        }));

        logger.error('Zoom API error getting meeting:', {
          meetingId,
          status: response.status,
          errorCode: error.code,
          errorMessage: error.message,
        });

        return null;
      }

      const data = await response.json();
      return this.mapToZoomMeeting(data);
    } catch (error) {
      logger.error('Error getting Zoom meeting:', {
        meetingId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Map Zoom API response to ZoomMeeting interface
   */
  private static mapToZoomMeeting(data: any): ZoomMeeting {
    return {
      id: String(data.id),
      uuid: data.uuid,
      hostId: data.host_id,
      hostEmail: data.host_email,
      topic: data.topic,
      type: data.type,
      status:
        data.status === 'waiting' ? 'waiting' : data.status === 'started' ? 'started' : 'finished',
      startTime: data.start_time,
      duration: data.duration,
      timezone: data.timezone,
      createdAt: data.created_at,
      startUrl: data.start_url,
      joinUrl: data.join_url,
      password: data.password,
      agenda: data.agenda,
      settings: {
        hostVideo: data.settings?.host_video ?? true,
        participantVideo: data.settings?.participant_video ?? true,
        joinBeforeHost: data.settings?.join_before_host ?? false,
        muteUponEntry: data.settings?.mute_upon_entry ?? false,
        waitingRoom: data.settings?.waiting_room ?? true,
        autoRecording: data.settings?.auto_recording ?? 'none',
      },
    };
  }
}
