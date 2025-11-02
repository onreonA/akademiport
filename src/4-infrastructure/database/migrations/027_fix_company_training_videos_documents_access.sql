-- ============================================================================
-- FIX COMPANY ACCESS TO TRAINING VIDEOS AND DOCUMENTS
-- ============================================================================
-- Bu migration company kullanıcılarının training videos ve documents'e
-- erişimini düzeltir. Migration 024 ve 025'te consultant policy'leri
-- güncellenirken company policy'leri korunmuş olmalı, ama kontrol edip
-- güncelliyoruz.
-- ============================================================================

-- Company policy'leri kontrol et ve güncelle
-- NOT: Migration 018'de oluşturulan policy'ler hala geçerli olmalı
-- Ama yine de kontrol edip güncelliyoruz

-- TRAINING_VIDEOS için company policy
-- ============================================================================

-- Önce mevcut policy'yi kaldır (eğer varsa)
DROP POLICY IF EXISTS "Company can view videos of assigned trainings" ON training_videos;

-- Company için yeni policy (migration 018'deki mantığı koruyoruz)
CREATE POLICY "Company can view videos of assigned trainings"
  ON training_videos
  FOR SELECT
  USING (
    is_master_admin() OR
    EXISTS (
      SELECT 1 FROM trainings t
      WHERE t.id = training_videos.training_id
        AND t.is_global = true
    ) OR
    user_company_has_training(training_videos.training_id)
  );

-- TRAINING_DOCUMENTS için company policy
-- ============================================================================

-- Önce mevcut policy'yi kaldır (eğer varsa)
DROP POLICY IF EXISTS "Company can view documents of assigned trainings" ON training_documents;

-- Company için yeni policy (migration 018'deki mantığı koruyoruz)
CREATE POLICY "Company can view documents of assigned trainings"
  ON training_documents
  FOR SELECT
  USING (
    is_master_admin() OR
    EXISTS (
      SELECT 1 FROM trainings t
      WHERE t.id = training_documents.training_id
        AND t.is_global = true
    ) OR
    user_company_has_training(training_documents.training_id)
  );

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- NOT: user_company_has_training fonksiyonu migration 018'de oluşturulmuştu
-- Bu migration sadece company policy'lerini günceller
-- ============================================================================


