/**
 * Leaderboard Points Constants
 * Her aktivite tipi için puan değerleri
 */
export const LEADERBOARD_POINTS: Record<string, number> = {
  // Proje Yönetimi
  TASK_COMPLETED: 10, // Görev tamamlama
  TASK_COMPLETED_EARLY: 12, // Zamanında tamamlama (+20%)
  SUBPROJECT_COMPLETED: 100, // Alt proje tamamlama
  TASK_COMMENT: 2, // Görev yorumu

  // Eğitimler
  VIDEO_WATCHED: 5, // Video izleme (dakika başına)
  DOCUMENT_READ: 10, // Döküman okuma
  TRAINING_MODULE_COMPLETED: 50, // Eğitim modülü tamamlama

  // Etkinlikler
  EVENT_ATTENDED: 30, // Etkinlik katılımı
  EVENT_ATTENDED_EARLY: 40, // Zamanında katılım (+33%)

  // Forum
  FORUM_TOPIC_CREATED: 10, // Konu açma
  FORUM_REPLY_CREATED: 5, // Yanıt yazma
  FORUM_SOLUTION_MARKED: 20, // Çözüm işaretlenme

  // Haberler
  NEWS_READ: 2, // Haber okuma
  NEWS_READ_COMPLETED: 7, // Tam okuma (+5 bonus)
  NEWS_COMMENT: 3, // Haber yorumu

  // Randevular
  APPOINTMENT_COMPLETED: 15, // Randevu tamamlama
  APPOINTMENT_NOTES: 5, // Randevu notları
};

/**
 * Get points for activity type
 */
export function getPointsForActivity(activityType: string): number {
  const key = activityType.toUpperCase().replace(/-/g, '_');
  return LEADERBOARD_POINTS[key] || 0;
}
