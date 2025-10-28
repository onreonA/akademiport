/**
 * Program Status Enum
 */

export enum ProgramStatus {
  PLANNED = 'planned',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
}

export const ProgramStatusLabels: Record<ProgramStatus, string> = {
  [ProgramStatus.PLANNED]: 'Planlandı',
  [ProgramStatus.ACTIVE]: 'Aktif',
  [ProgramStatus.COMPLETED]: 'Tamamlandı',
  [ProgramStatus.PAUSED]: 'Duraklatıldı',
  [ProgramStatus.CANCELLED]: 'İptal Edildi',
};
