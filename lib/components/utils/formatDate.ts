// =====================================================
// DATE FORMATTING UTILITIES
// =====================================================
// Tarih formatlama utility'leri
/**
 * Tarihi formatla
 */
export function formatDate(
  date: string | Date,
  options: {
    locale?: string;
    format?: 'short' | 'medium' | 'long' | 'full';
    includeTime?: boolean;
  } = {}
): string {
  const { locale = 'tr-TR', format = 'medium', includeTime = false } = options;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) {
    return 'Geçersiz tarih';
  }
  const formatOptions: Intl.DateTimeFormatOptions = {
    dateStyle: format,
    ...(includeTime && { timeStyle: 'short' }),
  };
  return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
}
/**
 * Tarihi relative formatla (örn: "2 gün önce")
 */
export function formatRelativeDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  if (diffInSeconds < 60) {
    return 'Az önce';
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} dakika önce`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} saat önce`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} gün önce`;
  }
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} hafta önce`;
  }
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ay önce`;
  }
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} yıl önce`;
}
/**
 * Tarihi kısa formatla (örn: "15 Mar 2024")
 */
export function formatShortDate(date: string | Date): string {
  return formatDate(date, { format: 'short' });
}
/**
 * Tarihi uzun formatla (örn: "15 Mart 2024 Cuma")
 */
export function formatLongDate(date: string | Date): string {
  return formatDate(date, { format: 'long' });
}
/**
 * Tarihi saat ile formatla (örn: "15 Mart 2024, 14:30")
 */
export function formatDateTime(date: string | Date): string {
  return formatDate(date, { format: 'medium', includeTime: true });
}
