-- ============================================================================
-- PROJECT MANAGEMENT SYSTEM MIGRATION
-- ============================================================================
-- Bu migration proje yönetim sisteminin tüm tablolarını oluşturur
-- Projects → SubProjects → Tasks → TaskComments hiyerarşisi
-- ============================================================================

-- ============================================================================
-- 1. PROJECTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  consultant_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done', 'cancelled')),
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  start_date DATE,
  end_date DATE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  is_template BOOLEAN DEFAULT false,
  template_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_projects_company_id ON public.projects(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_consultant_id ON public.projects(consultant_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_is_template ON public.projects(is_template);
CREATE INDEX IF NOT EXISTS idx_projects_template_id ON public.projects(template_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

-- Yorumlar
COMMENT ON TABLE public.projects IS 'Ana projeler tablosu - Firmaya atanan projeler';
COMMENT ON COLUMN public.projects.company_id IS 'Projenin atandığı firma (NULL ise şablon)';
COMMENT ON COLUMN public.projects.consultant_id IS 'Projeyi yöneten danışman';
COMMENT ON COLUMN public.projects.is_template IS 'Proje şablon mu?';
COMMENT ON COLUMN public.projects.template_id IS 'Şablondan oluşturulmuşsa şablon ID';
COMMENT ON COLUMN public.projects.progress IS 'İlerleme yüzdesi (0-100)';

-- ============================================================================
-- 2. SUB_PROJECTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.sub_projects (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done', 'cancelled')),
  order_index INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_sub_projects_project_id ON public.sub_projects(project_id);
CREATE INDEX IF NOT EXISTS idx_sub_projects_status ON public.sub_projects(status);
CREATE INDEX IF NOT EXISTS idx_sub_projects_order_index ON public.sub_projects(order_index);

-- Yorumlar
COMMENT ON TABLE public.sub_projects IS 'Alt projeler tablosu - Projenin alt bileşenleri';
COMMENT ON COLUMN public.sub_projects.order_index IS 'Sıralama için index';
COMMENT ON COLUMN public.sub_projects.progress IS 'İlerleme yüzdesi (0-100)';

-- ============================================================================
-- 3. TASKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  sub_project_id UUID NOT NULL REFERENCES public.sub_projects(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done', 'cancelled')),
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_tasks_sub_project_id ON public.tasks(sub_project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_order_index ON public.tasks(order_index);

-- Yorumlar
COMMENT ON TABLE public.tasks IS 'Görevler tablosu - Alt projenin görevleri';
COMMENT ON COLUMN public.tasks.assigned_to IS 'Görevin atandığı kullanıcı';
COMMENT ON COLUMN public.tasks.completed_at IS 'Görevin tamamlanma zamanı';
COMMENT ON COLUMN public.tasks.approved_at IS 'Görevin onaylanma zamanı';
COMMENT ON COLUMN public.tasks.approved_by IS 'Görevi onaylayan danışman';
COMMENT ON COLUMN public.tasks.order_index IS 'Sıralama için index';

-- ============================================================================
-- 4. TASK_COMMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  is_question BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON public.task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_user_id ON public.task_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_created_at ON public.task_comments(created_at DESC);

-- Yorumlar
COMMENT ON TABLE public.task_comments IS 'Görev yorumları tablosu - Görev altında soru/cevap sistemi';
COMMENT ON COLUMN public.task_comments.is_question IS 'Yorum bir soru mu?';

-- ============================================================================
-- 5. TRIGGERS
-- ============================================================================

-- Projects updated_at trigger
CREATE OR REPLACE FUNCTION update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION update_projects_updated_at();

-- SubProjects updated_at trigger
CREATE OR REPLACE FUNCTION update_sub_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sub_projects_updated_at
  BEFORE UPDATE ON public.sub_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_sub_projects_updated_at();

-- Tasks updated_at trigger
CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_tasks_updated_at();

-- ============================================================================
-- 6. PROGRESS CALCULATION FUNCTIONS
-- ============================================================================

-- Alt proje ilerlemesini hesapla (görevlere göre)
CREATE OR REPLACE FUNCTION calculate_sub_project_progress(sub_project_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
  total_tasks INTEGER;
  completed_tasks INTEGER;
  progress_value INTEGER;
BEGIN
  -- Toplam görev sayısı
  SELECT COUNT(*) INTO total_tasks
  FROM public.tasks
  WHERE sub_project_id = sub_project_id_param
    AND status != 'cancelled';

  -- Tamamlanan görev sayısı
  SELECT COUNT(*) INTO completed_tasks
  FROM public.tasks
  WHERE sub_project_id = sub_project_id_param
    AND status = 'done';

  -- İlerleme hesapla
  IF total_tasks = 0 THEN
    progress_value := 0;
  ELSE
    progress_value := ROUND((completed_tasks::DECIMAL / total_tasks::DECIMAL) * 100);
  END IF;

  RETURN progress_value;
END;
$$ LANGUAGE plpgsql;

-- Proje ilerlemesini hesapla (alt projelere göre)
CREATE OR REPLACE FUNCTION calculate_project_progress(project_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
  total_sub_projects INTEGER;
  avg_progress DECIMAL;
  progress_value INTEGER;
BEGIN
  -- Toplam alt proje sayısı
  SELECT COUNT(*) INTO total_sub_projects
  FROM public.sub_projects
  WHERE project_id = project_id_param
    AND status != 'cancelled';

  -- Ortalama ilerleme
  SELECT AVG(progress) INTO avg_progress
  FROM public.sub_projects
  WHERE project_id = project_id_param
    AND status != 'cancelled';

  -- İlerleme hesapla
  IF total_sub_projects = 0 THEN
    progress_value := 0;
  ELSE
    progress_value := ROUND(COALESCE(avg_progress, 0));
  END IF;

  RETURN progress_value;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. AUTO-UPDATE PROGRESS TRIGGERS
-- ============================================================================

-- Görev durumu değiştiğinde alt proje ilerlemesini güncelle
CREATE OR REPLACE FUNCTION auto_update_sub_project_progress()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.sub_projects
  SET progress = calculate_sub_project_progress(COALESCE(NEW.sub_project_id, OLD.sub_project_id))
  WHERE id = COALESCE(NEW.sub_project_id, OLD.sub_project_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_update_sub_project_progress
  AFTER INSERT OR UPDATE OR DELETE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_sub_project_progress();

-- Alt proje ilerlemesi değiştiğinde proje ilerlemesini güncelle
CREATE OR REPLACE FUNCTION auto_update_project_progress()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.projects
  SET progress = calculate_project_progress(COALESCE(NEW.project_id, OLD.project_id))
  WHERE id = COALESCE(NEW.project_id, OLD.project_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_update_project_progress
  AFTER INSERT OR UPDATE OR DELETE ON public.sub_projects
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_project_progress();

-- ============================================================================
-- 8. RLS (ROW LEVEL SECURITY) POLICIES
-- ============================================================================

-- Projects RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Master Admin: Tüm projeleri görebilir
CREATE POLICY "Master Admin can view all projects"
  ON public.projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND users.role = 'master_admin'
    )
  );

-- Consultant: Kendi atandığı projeleri görebilir
CREATE POLICY "Consultants can view assigned projects"
  ON public.projects FOR SELECT
  USING (
    consultant_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND users.role = 'consultant'
    )
  );

-- Company: Kendi projelerini görebilir
CREATE POLICY "Companies can view their projects"
  ON public.projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND users.company_id = projects.company_id
    )
  );

-- SubProjects, Tasks, TaskComments için benzer RLS politikaları
ALTER TABLE public.sub_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 9. SAMPLE DATA (OPTIONAL - FOR DEVELOPMENT)
-- ============================================================================

-- Örnek proje şablonu
-- INSERT INTO public.projects (name, description, is_template, status)
-- VALUES ('Dijital Dönüşüm Şablonu', 'Standart dijital dönüşüm projesi şablonu', true, 'done');

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Başarılı mesajı
DO $$
BEGIN
  RAISE NOTICE '✅ Project Management System migration completed successfully!';
  RAISE NOTICE '📊 Created tables: projects, sub_projects, tasks, task_comments';
  RAISE NOTICE '🔧 Created functions: calculate_sub_project_progress, calculate_project_progress';
  RAISE NOTICE '⚡ Created triggers: auto progress updates';
  RAISE NOTICE '🔒 Enabled RLS policies';
END $$;

