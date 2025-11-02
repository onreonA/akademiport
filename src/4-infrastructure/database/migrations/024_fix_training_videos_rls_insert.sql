-- ============================================================================
-- FIX TRAINING_VIDEOS RLS INSERT POLICY
-- ============================================================================
-- Bu migration training_videos tablosunda consultant'ın INSERT yapabilmesi
-- için RLS policy'lerini düzeltir.
-- ============================================================================

-- Consultant için mevcut policy'leri kaldır
-- NOT: Migration 018'de oluşturulan policy'yi de kaldırıyoruz
DROP POLICY IF EXISTS "Consultant can manage videos of own trainings" ON training_videos;
DROP POLICY IF EXISTS "Consultant can view videos of own trainings" ON training_videos;
DROP POLICY IF EXISTS "Consultant can insert videos to own trainings" ON training_videos;
DROP POLICY IF EXISTS "Consultant can update videos of own trainings" ON training_videos;
DROP POLICY IF EXISTS "Consultant can delete videos of own trainings" ON training_videos;

-- Master Admin policy'yi de güncelleyelim (FOR ALL için WITH CHECK eklememiz gerekiyor)
-- NOT: Master Admin policy'si zaten var ama FOR ALL kullanıyorsa WITH CHECK eklenmeli
-- Önce kontrol edip gerekirse drop edelim
DROP POLICY IF EXISTS "Master admin can do everything on training_videos" ON training_videos;

-- Master Admin için yeni policy (FOR ALL için WITH CHECK ekliyoruz)
CREATE POLICY "Master admin can do everything on training_videos"
  ON training_videos
  FOR ALL
  USING (is_master_admin())
  WITH CHECK (is_master_admin());

-- Consultant için ayrı policy'ler oluştur:
-- 1. SELECT için
CREATE POLICY "Consultant can view videos of own trainings"
  ON training_videos
  FOR SELECT
  USING (
    is_master_admin() OR
    EXISTS (
      SELECT 1 FROM trainings t
      WHERE t.id = training_videos.training_id
        AND (
          t.consultant_id = auth.uid() OR
          (t.program_id IS NOT NULL AND (
            is_program_manager(t.program_id) OR
            is_consultant_in_program(t.program_id)
          ))
        )
    )
  );

-- 2. INSERT için (WITH CHECK gerekli)
-- NOT: WITH CHECK clause'unda yeni satırın column'larına direkt erişilebilir
-- training_videos.training_id ile erişilir
-- Consultant'ın INSERT yapabilmesi için:
-- 1. Training'in consultant_id'si auth.uid() ile eşleşmeli VEYA
-- 2. Training'in program_id'si NULL değilse ve consultant bu programda manager VEYA consultant olmalı
CREATE POLICY "Consultant can insert videos to own trainings"
  ON training_videos
  FOR INSERT
  WITH CHECK (
    is_master_admin() OR
    EXISTS (
      SELECT 1 FROM trainings t
      WHERE t.id = training_videos.training_id
        AND (
          t.consultant_id = auth.uid() OR
          (t.program_id IS NOT NULL AND (
            is_program_manager(t.program_id) OR
            is_consultant_in_program(t.program_id)
          ))
        )
    )
  );

-- 3. UPDATE için
CREATE POLICY "Consultant can update videos of own trainings"
  ON training_videos
  FOR UPDATE
  USING (
    is_master_admin() OR
    EXISTS (
      SELECT 1 FROM trainings t
      WHERE t.id = training_videos.training_id
        AND (
          t.consultant_id = auth.uid() OR
          (t.program_id IS NOT NULL AND is_program_manager(t.program_id))
        )
    )
  )
  WITH CHECK (
    is_master_admin() OR
    EXISTS (
      SELECT 1 FROM trainings t
      WHERE t.id = training_videos.training_id
        AND (
          t.consultant_id = auth.uid() OR
          (t.program_id IS NOT NULL AND is_program_manager(t.program_id))
        )
    )
  );

-- 4. DELETE için
CREATE POLICY "Consultant can delete videos of own trainings"
  ON training_videos
  FOR DELETE
  USING (
    is_master_admin() OR
    EXISTS (
      SELECT 1 FROM trainings t
      WHERE t.id = training_videos.training_id
        AND (
          t.consultant_id = auth.uid() OR
          (t.program_id IS NOT NULL AND is_program_manager(t.program_id))
        )
    )
  );

