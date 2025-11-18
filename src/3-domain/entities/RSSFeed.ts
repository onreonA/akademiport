/**
 * RSS Feed Entity
 */

export interface RSSFeed {
  id: string;
  programId: string;
  name: string;
  feedUrl: string;
  description: string | null;
  category: string | null; // NewsCategory enum değeri
  isActive: boolean;
  autoPublish: boolean;
  checkIntervalMinutes: number;
  lastCheckedAt: Date | null;
  lastError: string | null;
  errorCount: number;
  successCount: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface RSSFeedItem {
  id: string;
  feedId: string;
  title: string;
  link: string;
  description: string | null;
  content: string | null;
  author: string | null;
  pubDate: Date | null;
  guid: string | null;
  imageUrl: string | null;
  categories: string[];
  isProcessed: boolean;
  processedAt: Date | null;
  newsId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * RSS Feed Entity with Business Logic
 */
export class RSSFeedEntity implements RSSFeed {
  id: string;
  programId: string;
  name: string;
  feedUrl: string;
  description: string | null;
  category: string | null;
  isActive: boolean;
  autoPublish: boolean;
  checkIntervalMinutes: number;
  lastCheckedAt: Date | null;
  lastError: string | null;
  errorCount: number;
  successCount: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;

  constructor(data: RSSFeed) {
    this.id = data.id;
    this.programId = data.programId;
    this.name = data.name;
    this.feedUrl = data.feedUrl;
    this.description = data.description;
    this.category = data.category;
    this.isActive = data.isActive;
    this.autoPublish = data.autoPublish;
    this.checkIntervalMinutes = data.checkIntervalMinutes;
    this.lastCheckedAt = data.lastCheckedAt;
    this.lastError = data.lastError;
    this.errorCount = data.errorCount;
    this.successCount = data.successCount;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.createdBy = data.createdBy;
    this.updatedBy = data.updatedBy;
  }

  /**
   * Feed aktif mi?
   */
  isActiveFeed(): boolean {
    return this.isActive;
  }

  /**
   * Feed kontrol edilmeli mi?
   */
  shouldCheck(): boolean {
    if (!this.isActive) {
      return false;
    }

    if (!this.lastCheckedAt) {
      return true;
    }

    const now = new Date();
    const lastChecked = new Date(this.lastCheckedAt);
    const minutesSinceLastCheck = (now.getTime() - lastChecked.getTime()) / (1000 * 60);

    return minutesSinceLastCheck >= this.checkIntervalMinutes;
  }

  /**
   * Başarılı kontrol kaydet
   */
  recordSuccess(): void {
    this.successCount += 1;
    this.lastCheckedAt = new Date();
    this.lastError = null;
    this.touch();
  }

  /**
   * Hata kaydet
   */
  recordError(error: string): void {
    this.errorCount += 1;
    this.lastCheckedAt = new Date();
    this.lastError = error;
    this.touch();
  }

  /**
   * Feed'i aktif et
   */
  activate(): void {
    this.isActive = true;
    this.touch();
  }

  /**
   * Feed'i pasif et
   */
  deactivate(): void {
    this.isActive = false;
    this.touch();
  }

  /**
   * Otomatik yayınlamayı aç
   */
  enableAutoPublish(): void {
    this.autoPublish = true;
    this.touch();
  }

  /**
   * Otomatik yayınlamayı kapat
   */
  disableAutoPublish(): void {
    this.autoPublish = false;
    this.touch();
  }

  /**
   * updatedAt'i güncelle
   */
  private touch(): void {
    this.updatedAt = new Date();
  }

  /**
   * Validation
   */
  static validate(data: Partial<RSSFeed>): string[] {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Feed adı gereklidir');
    }

    if (!data.feedUrl || data.feedUrl.trim().length === 0) {
      errors.push('Feed URL gereklidir');
    }

    if (data.feedUrl && !this.isValidUrl(data.feedUrl)) {
      errors.push('Geçerli bir URL giriniz');
    }

    if (!data.programId) {
      errors.push('Program ID gereklidir');
    }

    if (data.checkIntervalMinutes && data.checkIntervalMinutes < 60) {
      errors.push('Kontrol aralığı en az 60 dakika olmalıdır');
    }

    return errors;
  }

  /**
   * URL validation
   */
  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
