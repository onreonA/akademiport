/**
 * E-commerce Platform Type Enum
 *
 * E-ticaret platform tipleri
 */

export enum EcommercePlatformType {
  ALIBABA = 'alibaba',
  AMAZON = 'amazon',
  ETSY = 'etsy',
  TRENDYOL = 'trendyol',
  OZON = 'ozon',
  OTHER = 'other',
}

export const EcommercePlatformTypeLabels: Record<EcommercePlatformType, string> = {
  [EcommercePlatformType.ALIBABA]: 'Alibaba',
  [EcommercePlatformType.AMAZON]: 'Amazon',
  [EcommercePlatformType.ETSY]: 'Etsy',
  [EcommercePlatformType.TRENDYOL]: 'Trendyol',
  [EcommercePlatformType.OZON]: 'Ozon',
  [EcommercePlatformType.OTHER]: 'Diğer',
};

/**
 * Platform kategorileri
 */
export enum EcommercePlatformCategory {
  B2B = 'b2b', // Alibaba
  B2C = 'b2c', // Diğerleri
}

export const getPlatformCategory = (platform: EcommercePlatformType): EcommercePlatformCategory => {
  return platform === EcommercePlatformType.ALIBABA
    ? EcommercePlatformCategory.B2B
    : EcommercePlatformCategory.B2C;
};
