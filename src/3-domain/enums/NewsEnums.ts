/**
 * News Category Enum
 */
export enum NewsCategory {
  E_COMMERCE = 'e_commerce',
  E_EXPORT = 'e_export',
  TECHNOLOGY = 'technology',
  DIGITAL_MARKETING = 'digital_marketing',
  LOGISTICS = 'logistics',
  FINANCE = 'finance',
  LEGAL = 'legal',
  GENERAL = 'general',
}

export const NEWS_CATEGORY_LABELS: Record<NewsCategory, string> = {
  [NewsCategory.E_COMMERCE]: 'E-ticaret',
  [NewsCategory.E_EXPORT]: 'E-ihracat',
  [NewsCategory.TECHNOLOGY]: 'Teknoloji',
  [NewsCategory.DIGITAL_MARKETING]: 'Dijital Pazarlama',
  [NewsCategory.LOGISTICS]: 'Lojistik',
  [NewsCategory.FINANCE]: 'Finans',
  [NewsCategory.LEGAL]: 'Hukuki',
  [NewsCategory.GENERAL]: 'Genel',
};

/**
 * News Status Enum
 */
export enum NewsStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export const NEWS_STATUS_LABELS: Record<NewsStatus, string> = {
  [NewsStatus.DRAFT]: 'Taslak',
  [NewsStatus.PUBLISHED]: 'Yayında',
  [NewsStatus.ARCHIVED]: 'Arşiv',
};

export const NEWS_STATUS_COLORS: Record<NewsStatus, string> = {
  [NewsStatus.DRAFT]: 'gray',
  [NewsStatus.PUBLISHED]: 'green',
  [NewsStatus.ARCHIVED]: 'orange',
};


