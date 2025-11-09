/**
 * Appointment Status Enum
 * Randevu durumları
 */

export type AppointmentStatus =
  | 'pending' // Beklemede (Company tarafından talep edildi, Consultant onayı bekleniyor)
  | 'approved' // Onaylandı (Consultant onayladı, Zoom meeting oluşturuldu)
  | 'rejected' // Reddedildi (Consultant reddetti)
  | 'completed' // Tamamlandı (Randevu gerçekleşti)
  | 'cancelled'; // İptal edildi (Reschedule veya manuel iptal)

/**
 * Appointment status display names (Turkish)
 */
export const AppointmentStatusLabels: Record<AppointmentStatus, string> = {
  pending: 'Beklemede',
  approved: 'Onaylandı',
  rejected: 'Reddedildi',
  completed: 'Tamamlandı',
  cancelled: 'İptal Edildi',
};

/**
 * Appointment status colors (for UI)
 */
export const AppointmentStatusColors: Record<AppointmentStatus, string> = {
  pending: 'yellow',
  approved: 'green',
  rejected: 'red',
  completed: 'blue',
  cancelled: 'gray',
};

/**
 * Check if status is active (not completed or cancelled)
 */
export function isActiveStatus(status: AppointmentStatus): boolean {
  return status === 'pending' || status === 'approved';
}

/**
 * Check if status allows reschedule
 */
export function canReschedule(status: AppointmentStatus): boolean {
  return status === 'pending' || status === 'approved';
}

/**
 * Check if status allows approval
 */
export function canApprove(status: AppointmentStatus): boolean {
  return status === 'pending';
}

/**
 * Check if status allows rejection
 */
export function canReject(status: AppointmentStatus): boolean {
  return status === 'pending';
}
