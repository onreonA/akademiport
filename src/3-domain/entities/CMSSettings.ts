/**
 * CMS Settings Entity
 * Sprint 23: CMS
 */

export type CMSSettingsCategory = 'general' | 'contact' | 'social' | 'analytics';

export interface CMSSettings {
  id: string;
  key: string;
  value: any; // JSONB - herhangi bir JSON değer
  category: CMSSettingsCategory;
  description?: string | null;
  updatedBy?: string | null;
  updatedAt: Date;
}

export interface CreateCMSSettingsDto {
  key: string;
  value: any;
  category: CMSSettingsCategory;
  description?: string;
}

export interface UpdateCMSSettingsDto {
  value?: any;
  category?: CMSSettingsCategory;
  description?: string;
}

export interface CMSSettingsFilter {
  category?: CMSSettingsCategory;
  search?: string;
}

export class CMSSettingsEntity {
  constructor(private settings: CMSSettings) {}

  get id(): string {
    return this.settings.id;
  }

  get key(): string {
    return this.settings.key;
  }

  get value(): any {
    return this.settings.value;
  }

  get category(): CMSSettingsCategory {
    return this.settings.category;
  }

  /**
   * Get value as string
   */
  getValueAsString(): string {
    if (typeof this.settings.value === 'string') {
      return this.settings.value;
    }
    return JSON.stringify(this.settings.value);
  }

  /**
   * Get value as number
   */
  getValueAsNumber(): number | null {
    if (typeof this.settings.value === 'number') {
      return this.settings.value;
    }
    const num = Number(this.settings.value);
    return isNaN(num) ? null : num;
  }

  /**
   * Get value as boolean
   */
  getValueAsBoolean(): boolean {
    if (typeof this.settings.value === 'boolean') {
      return this.settings.value;
    }
    if (typeof this.settings.value === 'string') {
      return this.settings.value.toLowerCase() === 'true';
    }
    return Boolean(this.settings.value);
  }

  /**
   * Get value as array
   */
  getValueAsArray(): any[] {
    if (Array.isArray(this.settings.value)) {
      return this.settings.value;
    }
    return [];
  }

  /**
   * Get value as object
   */
  getValueAsObject(): Record<string, any> {
    if (typeof this.settings.value === 'object' && !Array.isArray(this.settings.value)) {
      return this.settings.value;
    }
    return {};
  }

  /**
   * To plain object
   */
  toJSON(): CMSSettings {
    return { ...this.settings };
  }
}
