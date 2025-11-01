-- =====================================================
-- TRIGGERS
-- =====================================================
-- Otomatik güncelleme ve validation trigger'ları

-- =====================================================
-- Updated At Trigger Function
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_programs_updated_at BEFORE UPDATE ON user_programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Company User Count Trigger
-- =====================================================
-- Firma kullanıcı sayısını otomatik günceller

CREATE OR REPLACE FUNCTION update_company_user_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.company_id IS NOT NULL THEN
    UPDATE companies 
    SET current_users = current_users + 1 
    WHERE id = NEW.company_id;
  ELSIF TG_OP = 'DELETE' AND OLD.company_id IS NOT NULL THEN
    UPDATE companies 
    SET current_users = current_users - 1 
    WHERE id = OLD.company_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.company_id IS NOT NULL AND NEW.company_id IS NULL THEN
      -- User removed from company
      UPDATE companies 
      SET current_users = current_users - 1 
      WHERE id = OLD.company_id;
    ELSIF OLD.company_id IS NULL AND NEW.company_id IS NOT NULL THEN
      -- User added to company
      UPDATE companies 
      SET current_users = current_users + 1 
      WHERE id = NEW.company_id;
    ELSIF OLD.company_id IS NOT NULL AND NEW.company_id IS NOT NULL AND OLD.company_id != NEW.company_id THEN
      -- User moved to different company
      UPDATE companies 
      SET current_users = current_users - 1 
      WHERE id = OLD.company_id;
      
      UPDATE companies 
      SET current_users = current_users + 1 
      WHERE id = NEW.company_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_company_user_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW 
  EXECUTE FUNCTION update_company_user_count();

-- =====================================================
-- Program Company Count Trigger
-- =====================================================
-- Program firma sayısını otomatik günceller

CREATE OR REPLACE FUNCTION update_program_company_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE programs 
    SET current_companies = current_companies + 1 
    WHERE id = NEW.program_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE programs 
    SET current_companies = current_companies - 1 
    WHERE id = OLD.program_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.program_id != NEW.program_id THEN
    UPDATE programs 
    SET current_companies = current_companies - 1 
    WHERE id = OLD.program_id;
    
    UPDATE programs 
    SET current_companies = current_companies + 1 
    WHERE id = NEW.program_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_program_company_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON companies
  FOR EACH ROW 
  EXECUTE FUNCTION update_program_company_count();

-- =====================================================
-- Slug Generation Trigger
-- =====================================================
-- Otomatik slug oluşturur (name'den)

CREATE OR REPLACE FUNCTION generate_slug()
RETURNS TRIGGER AS $$
DECLARE
  slug_exists BOOLEAN;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    -- Turkish character conversion
    NEW.slug = lower(NEW.name);
    NEW.slug = regexp_replace(NEW.slug, '[çÇ]', 'c', 'g');
    NEW.slug = regexp_replace(NEW.slug, '[ğĞ]', 'g', 'g');
    NEW.slug = regexp_replace(NEW.slug, '[ıİ]', 'i', 'g');
    NEW.slug = regexp_replace(NEW.slug, '[öÖ]', 'o', 'g');
    NEW.slug = regexp_replace(NEW.slug, '[şŞ]', 's', 'g');
    NEW.slug = regexp_replace(NEW.slug, '[üÜ]', 'u', 'g');
    
    -- Remove special characters
    NEW.slug = regexp_replace(NEW.slug, '[^a-z0-9]+', '-', 'g');
    NEW.slug = regexp_replace(NEW.slug, '^-+|-+$', '', 'g');
    
    -- Check uniqueness dynamically
    EXECUTE format('SELECT EXISTS (SELECT 1 FROM %I WHERE slug = $1 AND id != COALESCE($2, ''00000000-0000-0000-0000-000000000000''::uuid))', TG_TABLE_NAME)
      INTO slug_exists
      USING NEW.slug, NEW.id;
    
    -- Add suffix if not unique
    IF slug_exists THEN
      NEW.slug = NEW.slug || '-' || substr(md5(random()::text), 1, 6);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_program_slug BEFORE INSERT OR UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION generate_slug();

CREATE TRIGGER generate_company_slug BEFORE INSERT OR UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION generate_slug();

-- =====================================================
-- User Email Verification Trigger
-- =====================================================
-- NOT: Bu trigger kaldırıldı çünkü auth.users INSERT sırasında hata veriyordu
-- Email verification zaten UserRepository'de direkt set ediliyor (is_email_verified: true)
-- 
-- Eğer gelecekte email verification senkronizasyonu gerekirse:
-- 1. Supabase Webhook kullanılabilir (auth.users UPDATE event'inde)
-- 2. Ya da API endpoint ile manuel senkronize edilebilir
--
-- CREATE OR REPLACE FUNCTION sync_user_email_verification()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   IF TG_OP = 'UPDATE' THEN
--     IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
--       UPDATE public.users 
--       SET is_email_verified = true 
--       WHERE id = NEW.id;
--     END IF;
--   END IF;
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;
--
-- CREATE TRIGGER sync_user_email_verification_trigger
--   AFTER UPDATE ON auth.users
--   FOR EACH ROW 
--   EXECUTE FUNCTION sync_user_email_verification();

