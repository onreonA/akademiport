/**
 * Calendar Utilities
 *
 * Shared utility functions for calendar operations
 * Used by both Event and Appointment modules
 */

export interface TimeSlot {
  start: Date;
  end: Date;
}

export interface AvailabilityCheck {
  isAvailable: boolean;
  conflicts?: Array<{ type: 'event' | 'appointment'; id: string; title: string }>;
}

/**
 * Check if two time slots overlap
 */
export function isTimeSlotOverlapping(slot1: TimeSlot, slot2: TimeSlot): boolean {
  return slot1.start < slot2.end && slot1.end > slot2.start;
}

/**
 * Check if a time slot conflicts with multiple other slots
 */
export function findConflicts(
  targetSlot: TimeSlot,
  existingSlots: Array<TimeSlot & { id: string; title: string; type: 'event' | 'appointment' }>
): Array<{ type: 'event' | 'appointment'; id: string; title: string }> {
  return existingSlots
    .filter((slot) => isTimeSlotOverlapping(targetSlot, slot))
    .map((slot) => ({
      type: slot.type,
      id: slot.id,
      title: slot.title,
    }));
}

/**
 * Format date for display
 */
export function formatEventDate(date: Date, includeTime: boolean = true): string {
  const dateStr = date.toLocaleDateString('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (!includeTime) {
    return dateStr;
  }

  const timeStr = date.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${dateStr} ${timeStr}`;
}

/**
 * Format time range for display
 */
export function formatTimeRange(start: Date, end: Date): string {
  const startTime = start.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const endTime = end.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${startTime} - ${endTime}`;
}

/**
 * Calculate duration in minutes
 */
export function calculateDurationMinutes(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
}

/**
 * Check if date is in the past
 */
export function isPastDate(date: Date): boolean {
  return date.getTime() < Date.now();
}

/**
 * Check if date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if date is tomorrow
 */
export function isTomorrow(date: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  );
}

/**
 * Get relative time string (e.g., "3 gün sonra", "yarın", "bugün")
 */
export function getRelativeTimeString(date: Date): string {
  if (isToday(date)) {
    return 'Bugün';
  }

  if (isTomorrow(date)) {
    return 'Yarın';
  }

  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `${Math.abs(diffDays)} gün önce`;
  }

  if (diffDays === 0) {
    return 'Bugün';
  }

  if (diffDays === 1) {
    return 'Yarın';
  }

  if (diffDays < 7) {
    return `${diffDays} gün sonra`;
  }

  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} hafta sonra`;
  }

  return formatEventDate(date, false);
}

/**
 * Get timezone offset string (e.g., "+03:00")
 */
export function getTimezoneOffset(date: Date): string {
  const offset = -date.getTimezoneOffset();
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;
  const sign = offset >= 0 ? '+' : '-';
  return `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Convert date to ISO string with timezone
 */
export function toISOStringWithTimezone(date: Date): string {
  const tzOffset = -date.getTimezoneOffset();
  const diff = tzOffset >= 0 ? '+' : '-';
  const pad = (n: number) => `${Math.floor(Math.abs(n))}`.padStart(2, '0');
  return (
    date.getFullYear() +
    '-' +
    pad(date.getMonth() + 1) +
    '-' +
    pad(date.getDate()) +
    'T' +
    pad(date.getHours()) +
    ':' +
    pad(date.getMinutes()) +
    ':' +
    pad(date.getSeconds()) +
    diff +
    pad(tzOffset / 60) +
    ':' +
    pad(tzOffset % 60)
  );
}

/**
 * Parse ISO string to Date (handles timezone)
 */
export function parseISOString(isoString: string): Date {
  return new Date(isoString);
}

/**
 * Get business hours (default: 09:00-17:00)
 */
export function getBusinessHours(): { start: number; end: number } {
  return {
    start: 9, // 09:00
    end: 17, // 17:00
  };
}

/**
 * Check if time is within business hours
 */
export function isWithinBusinessHours(
  date: Date,
  businessHours?: { start: number; end: number }
): boolean {
  const hours = businessHours || getBusinessHours();
  const hour = date.getHours();
  return hour >= hours.start && hour < hours.end;
}

/**
 * Get available time slots for a day
 */
export function getAvailableTimeSlots(
  date: Date,
  durationMinutes: number,
  existingSlots: TimeSlot[],
  businessHours?: { start: number; end: number }
): TimeSlot[] {
  const hours = businessHours || getBusinessHours();
  const slots: TimeSlot[] = [];
  const startOfDay = new Date(date);
  startOfDay.setHours(hours.start, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(hours.end, 0, 0, 0);

  const currentTime = new Date(startOfDay);

  while (currentTime.getTime() + durationMinutes * 60 * 1000 <= endOfDay.getTime()) {
    const slotEnd = new Date(currentTime.getTime() + durationMinutes * 60 * 1000);
    const slot: TimeSlot = { start: new Date(currentTime), end: slotEnd };

    // Check if slot conflicts with existing slots
    const hasConflict = existingSlots.some((existing) => isTimeSlotOverlapping(slot, existing));

    if (!hasConflict) {
      slots.push(slot);
    }

    // Move to next 30-minute slot
    currentTime.setMinutes(currentTime.getMinutes() + 30);
  }

  return slots;
}

/**
 * Validate date range (start < end)
 */
export function validateDateRange(start: Date, end: Date): { valid: boolean; error?: string } {
  if (start >= end) {
    return {
      valid: false,
      error: 'Başlangıç tarihi bitiş tarihinden önce olmalıdır',
    };
  }

  if (start.getTime() < Date.now() - 1000 * 60 * 60) {
    // Allow 1 hour buffer for timezone issues
    return {
      valid: false,
      error: 'Başlangıç tarihi geçmişte olamaz',
    };
  }

  return { valid: true };
}
