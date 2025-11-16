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
  HEPSIBURADA = 'hepsiburada',
  N11 = 'n11',
  GITTI_GIDIYOR = 'gitti-gidiyor',
  OTHER = 'other',
}

export const EcommercePlatformTypeLabels: Record<EcommercePlatformType, string> = {
  [EcommercePlatformType.ALIBABA]: 'Alibaba',
  [EcommercePlatformType.AMAZON]: 'Amazon',
  [EcommercePlatformType.ETSY]: 'Etsy',
  [EcommercePlatformType.TRENDYOL]: 'Trendyol',
  [EcommercePlatformType.HEPSIBURADA]: 'Hepsiburada',
  [EcommercePlatformType.N11]: 'N11',
  [EcommercePlatformType.GITTI_GIDIYOR]: 'Gitti Gidiyor',
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
