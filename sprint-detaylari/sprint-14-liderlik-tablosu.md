# 🏆 Sprint 14: Liderlik Tablosu Sistemi

**Durum:** 📋 Planlandı  
**Tahmini Başlangıç:** 24 Kasım 2025  
**Tahmini Bitiş:** 1 Aralık 2025  
**Süre:** 1 hafta  
**Bağımlılıklar:** Sprint 8 (Proje Yönetimi), Sprint 9 (Eğitim), Sprint 10 (Etkinlik), Sprint 12 (Haberler), Sprint 13 (Forum)

---

## 🎯 SPRINT HEDEF

Kapsamlı liderlik tablosu sistemi + Rozet sistemi + Tüm modül entegrasyonu

**Ana Hedefler:**

1. ✅ Çok kaynaklı puan sistemi (6 modül)
2. ✅ Otomatik puan hesaplama
3. ✅ Rozet kazanma sistemi
4. ✅ Program bazlı sıralama
5. ✅ Trend analizi
6. ✅ Dashboard entegrasyonu

---

## 📦 KAPSAM

### 1. Database Layer

#### Migration: `034_create_leaderboard_tables.sql`

```sql
-- =====================================================
-- LEADERBOARD SYSTEM TABLES
-- =====================================================

-- =====================================================
-- LEADERBOARD SCORES TABLE
-- =====================================================
CREATE TABLE leaderboard_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- İlişkiler
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,

  -- Aktivite bilgileri
  activity_type VARCHAR(50) NOT NULL,    -- 'task_completed', 'video_watched', etc.
  activity_id UUID,                      -- İlgili aktivitenin ID'si

  -- Puan hesaplama
  points INTEGER NOT NULL,               -- Temel puan
  multiplier DECIMAL(3, 2) DEFAULT 1.0,  -- Çarpan (bonus için)
  final_points INTEGER NOT NULL,         -- points × multiplier

  -- Ek bilgiler
  metadata JSONB,                        -- Aktiviteye özel ek bilgiler

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_points CHECK (points >= 0),
  CONSTRAINT valid_multiplier CHECK (multiplier >= 0),
  CONSTRAINT valid_final_points CHECK (final_points >= 0)
);

-- =====================================================
-- LEADERBOARD BADGES TABLE (Rozet tanımları)
-- =====================================================
CREATE TABLE leaderboard_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Rozet bilgileri
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(255),                     -- Icon name veya URL
  category VARCHAR(50) NOT NULL,         -- 'project', 'training', 'event', etc.

  -- Kazanma koşulu
  requirement_type VARCHAR(50) NOT NULL, -- 'count', 'streak', 'milestone', 'threshold'
  requirement_value INTEGER NOT NULL,    -- Gerekli değer
  requirement_activity VARCHAR(50),      -- İlgili aktivite tipi

  -- Bonus puan
  points_bonus INTEGER DEFAULT 0,        -- Rozet kazanıldığında bonus puan

  -- Görünürlük
  is_active BOOLEAN DEFAULT TRUE,
  order_index INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- COMPANY BADGES TABLE (Firmaların kazandığı rozetler)
-- =====================================================
CREATE TABLE company_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- İlişkiler
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES leaderboard_badges(id) ON DELETE CASCADE,

  -- Kazanma bilgileri
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(company_id, badge_id)
);

-- =====================================================
-- LEADERBOARD RANKINGS (Materialized View)
-- =====================================================
CREATE MATERIALIZED VIEW leaderboard_rankings AS
SELECT
  c.id AS company_id,
  c.name AS company_name,
  c.program_id,

  -- Toplam puanlar
  COALESCE(SUM(ls.final_points), 0) AS total_score,

  -- Modül bazlı puanlar
  COALESCE(SUM(CASE WHEN ls.activity_type LIKE 'task_%' OR ls.activity_type LIKE 'project_%' THEN ls.final_points ELSE 0 END), 0) AS project_score,
  COALESCE(SUM(CASE WHEN ls.activity_type LIKE 'video_%' OR ls.activity_type LIKE 'document_%' OR ls.activity_type LIKE 'training_%' THEN ls.final_points ELSE 0 END), 0) AS training_score,
  COALESCE(SUM(CASE WHEN ls.activity_type LIKE 'event_%' THEN ls.final_points ELSE 0 END), 0) AS event_score,
  COALESCE(SUM(CASE WHEN ls.activity_type LIKE 'forum_%' THEN ls.final_points ELSE 0 END), 0) AS forum_score,
  COALESCE(SUM(CASE WHEN ls.activity_type LIKE 'news_%' THEN ls.final_points ELSE 0 END), 0) AS news_score,
  COALESCE(SUM(CASE WHEN ls.activity_type LIKE 'appointment_%' THEN ls.final_points ELSE 0 END), 0) AS appointment_score,

  -- Sıralama (program bazlı)
  RANK() OVER (PARTITION BY c.program_id ORDER BY COALESCE(SUM(ls.final_points), 0) DESC) AS rank,

  -- Rozet sayısı
  COUNT(DISTINCT cb.badge_id) AS badge_count,

  -- Son aktivite
  MAX(ls.created_at) AS last_activity_at

FROM companies c
LEFT JOIN leaderboard_scores ls ON c.id = ls.company_id
LEFT JOIN company_badges cb ON c.id = cb.company_id
WHERE c.is_active = TRUE
GROUP BY c.id, c.name, c.program_id;

-- Unique index for concurrent refresh
CREATE UNIQUE INDEX idx_leaderboard_rankings_company ON leaderboard_rankings(company_id);

-- =====================================================
-- LEADERBOARD HISTORY (Haftalık snapshot)
-- =====================================================
CREATE TABLE leaderboard_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- İlişkiler
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,

  -- Snapshot tarihi
  snapshot_date DATE NOT NULL,

  -- Puanlar (o tarihteki durum)
  total_score INTEGER NOT NULL,
  project_score INTEGER DEFAULT 0,
  training_score INTEGER DEFAULT 0,
  event_score INTEGER DEFAULT 0,
  forum_score INTEGER DEFAULT 0,
  news_score INTEGER DEFAULT 0,
  appointment_score INTEGER DEFAULT 0,

  -- Sıralama
  rank INTEGER NOT NULL,

  -- Rozet sayısı
  badge_count INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(company_id, snapshot_date)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Scores indexes
CREATE INDEX idx_leaderboard_scores_company ON leaderboard_scores(company_id);
CREATE INDEX idx_leaderboard_scores_program ON leaderboard_scores(program_id);
CREATE INDEX idx_leaderboard_scores_activity_type ON leaderboard_scores(activity_type);
CREATE INDEX idx_leaderboard_scores_created ON leaderboard_scores(created_at DESC);

-- Badges indexes
CREATE INDEX idx_leaderboard_badges_category ON leaderboard_badges(category);
CREATE INDEX idx_leaderboard_badges_active ON leaderboard_badges(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_leaderboard_badges_order ON leaderboard_badges(order_index);

-- Company badges indexes
CREATE INDEX idx_company_badges_company ON company_badges(company_id);
CREATE INDEX idx_company_badges_badge ON company_badges(badge_id);
CREATE INDEX idx_company_badges_earned ON company_badges(earned_at DESC);

-- History indexes
CREATE INDEX idx_leaderboard_history_company ON leaderboard_history(company_id);
CREATE INDEX idx_leaderboard_history_program ON leaderboard_history(program_id);
CREATE INDEX idx_leaderboard_history_date ON leaderboard_history(snapshot_date DESC);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Refresh leaderboard rankings
CREATE OR REPLACE FUNCTION refresh_leaderboard()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_rankings;
END;
$$ LANGUAGE plpgsql;

-- Add leaderboard score
CREATE OR REPLACE FUNCTION add_leaderboard_score(
  p_company_id UUID,
  p_program_id UUID,
  p_activity_type VARCHAR(50),
  p_activity_id UUID,
  p_points INTEGER,
  p_multiplier DECIMAL(3, 2) DEFAULT 1.0,
  p_metadata JSONB DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_final_points INTEGER;
BEGIN
  -- Calculate final points
  v_final_points := FLOOR(p_points * p_multiplier);

  -- Insert score
  INSERT INTO leaderboard_scores (
    company_id,
    program_id,
    activity_type,
    activity_id,
    points,
    multiplier,
    final_points,
    metadata
  ) VALUES (
    p_company_id,
    p_program_id,
    p_activity_type,
    p_activity_id,
    p_points,
    p_multiplier,
    v_final_points,
    p_metadata
  );

  -- Check for badge achievements
  PERFORM check_badge_achievements(p_company_id);
END;
$$ LANGUAGE plpgsql;

-- Check badge achievements
CREATE OR REPLACE FUNCTION check_badge_achievements(p_company_id UUID)
RETURNS void AS $$
DECLARE
  v_badge RECORD;
  v_count INTEGER;
  v_already_earned BOOLEAN;
BEGIN
  -- Loop through all active badges
  FOR v_badge IN
    SELECT * FROM leaderboard_badges
    WHERE is_active = TRUE
  LOOP
    -- Check if already earned
    SELECT EXISTS (
      SELECT 1 FROM company_badges
      WHERE company_id = p_company_id AND badge_id = v_badge.id
    ) INTO v_already_earned;

    IF NOT v_already_earned THEN
      -- Check requirement based on type
      IF v_badge.requirement_type = 'count' THEN
        -- Count activities
        SELECT COUNT(*) INTO v_count
        FROM leaderboard_scores
        WHERE company_id = p_company_id
        AND activity_type = v_badge.requirement_activity;

        IF v_count >= v_badge.requirement_value THEN
          -- Award badge
          INSERT INTO company_badges (company_id, badge_id)
          VALUES (p_company_id, v_badge.id);

          -- Add bonus points if any
          IF v_badge.points_bonus > 0 THEN
            INSERT INTO leaderboard_scores (
              company_id,
              program_id,
              activity_type,
              activity_id,
              points,
              multiplier,
              final_points,
              metadata
            ) SELECT
              p_company_id,
              program_id,
              'badge_earned',
              v_badge.id,
              v_badge.points_bonus,
              1.0,
              v_badge.points_bonus,
              jsonb_build_object('badge_name', v_badge.name)
            FROM companies WHERE id = p_company_id;
          END IF;
        END IF;

      ELSIF v_badge.requirement_type = 'threshold' THEN
        -- Check total score threshold
        SELECT COALESCE(SUM(final_points), 0) INTO v_count
        FROM leaderboard_scores
        WHERE company_id = p_company_id;

        IF v_count >= v_badge.requirement_value THEN
          -- Award badge
          INSERT INTO company_badges (company_id, badge_id)
          VALUES (p_company_id, v_badge.id);
        END IF;
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create weekly snapshot
CREATE OR REPLACE FUNCTION create_leaderboard_snapshot()
RETURNS void AS $$
BEGIN
  INSERT INTO leaderboard_history (
    company_id,
    program_id,
    snapshot_date,
    total_score,
    project_score,
    training_score,
    event_score,
    forum_score,
    news_score,
    appointment_score,
    rank,
    badge_count
  )
  SELECT
    company_id,
    program_id,
    CURRENT_DATE,
    total_score,
    project_score,
    training_score,
    event_score,
    forum_score,
    news_score,
    appointment_score,
    rank,
    badge_count
  FROM leaderboard_rankings
  ON CONFLICT (company_id, snapshot_date) DO UPDATE
  SET
    total_score = EXCLUDED.total_score,
    project_score = EXCLUDED.project_score,
    training_score = EXCLUDED.training_score,
    event_score = EXCLUDED.event_score,
    forum_score = EXCLUDED.forum_score,
    news_score = EXCLUDED.news_score,
    appointment_score = EXCLUDED.appointment_score,
    rank = EXCLUDED.rank,
    badge_count = EXCLUDED.badge_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE leaderboard_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_history ENABLE ROW LEVEL SECURITY;

-- Scores policies
CREATE POLICY "Admin can view all scores"
  ON leaderboard_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('master_admin', 'consultant')
    )
  );

CREATE POLICY "Companies can view their own scores"
  ON leaderboard_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      JOIN companies ON companies.id = users.company_id
      WHERE users.id = auth.uid()
      AND companies.id = leaderboard_scores.company_id
    )
  );

-- Badges policies
CREATE POLICY "Everyone can view badges"
  ON leaderboard_badges FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admin can manage badges"
  ON leaderboard_badges FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'master_admin'
    )
  );

-- Company badges policies
CREATE POLICY "Everyone can view company badges"
  ON company_badges FOR SELECT
  USING (TRUE);

-- History policies
CREATE POLICY "Admin can view all history"
  ON leaderboard_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('master_admin', 'consultant')
    )
  );

CREATE POLICY "Companies can view their own history"
  ON leaderboard_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      JOIN companies ON companies.id = users.company_id
      WHERE users.id = auth.uid()
      AND companies.id = leaderboard_history.company_id
    )
  );

-- =====================================================
-- SEED DATA: BADGES
-- =====================================================

INSERT INTO leaderboard_badges (name, description, icon, category, requirement_type, requirement_value, requirement_activity, points_bonus, order_index) VALUES
  -- Proje Rozetleri
  ('İlk Adım', 'İlk görevini tamamladın!', '🎯', 'project', 'count', 1, 'task_completed', 10, 1),
  ('Görev Avcısı', '10 görev tamamladın!', '🏹', 'project', 'count', 10, 'task_completed', 50, 2),
  ('Görev Ustası', '50 görev tamamladın!', '⚔️', 'project', 'count', 50, 'task_completed', 200, 3),
  ('Proje Tamamlayıcı', 'Bir alt projeyi tamamladın!', '🏆', 'project', 'count', 1, 'subproject_completed', 100, 4),

  -- Eğitim Rozetleri
  ('Öğrenmeye Açık', 'İlk videoyu izledin!', '📚', 'training', 'count', 1, 'video_watched', 10, 11),
  ('Bilgi Aşığı', '20 video izledin!', '🎓', 'training', 'count', 20, 'video_watched', 100, 12),
  ('Eğitim Şampiyonu', 'Tüm eğitimleri tamamladın!', '👑', 'training', 'count', 1, 'training_completed', 500, 13),

  -- Etkinlik Rozetleri
  ('Katılımcı', 'İlk etkinliğe katıldın!', '🎪', 'event', 'count', 1, 'event_attended', 10, 21),
  ('Etkinlik Bağımlısı', '10 etkinliğe katıldın!', '🎉', 'event', 'count', 10, 'event_attended', 100, 22),

  -- Forum Rozetleri
  ('Soru Soran', 'İlk konunu açtın!', '❓', 'forum', 'count', 1, 'forum_topic_created', 10, 31),
  ('Yardımsever', '10 yanıt yazdın!', '🤝', 'forum', 'count', 10, 'forum_reply_created', 50, 32),
  ('Çözüm Üreticisi', '5 çözüm işaretlendin!', '💡', 'forum', 'count', 5, 'forum_solution_marked', 200, 33),

  -- Haberler Rozetleri
  ('Bilgili', '10 haber okudun!', '📰', 'news', 'count', 10, 'news_read', 20, 41),
  ('Sektör Takipçisi', '50 haber okudun!', '📊', 'news', 'count', 50, 'news_read', 100, 42),

  -- Genel Rozetleri (threshold bazlı)
  ('Yıldız', '100 puana ulaştın!', '⭐', 'general', 'threshold', 100, NULL, 0, 51),
  ('Süper Yıldız', '500 puana ulaştın!', '🌟', 'general', 'threshold', 500, NULL, 0, 52),
  ('Efsane', '1000 puana ulaştın!', '🏅', 'general', 'threshold', 1000, NULL, 0, 53);
```

---

### 2. Puan Sistemi Detayları

#### Aktivite Tipleri ve Puanlar

```typescript
export const LEADERBOARD_POINTS = {
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
```

---

### 3. Application Layer

#### Use Cases

`src/2-application/use-cases/leaderboard/AddLeaderboardScoreUseCase.ts`:

```typescript
import { ILeaderboardRepository } from '@/domain/interfaces/repositories/ILeaderboardRepository';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';
import { LEADERBOARD_POINTS } from '@/shared/constants/leaderboard';

export interface AddScoreDto {
  companyId: string;
  activityType: string;
  activityId?: string;
  points?: number; // Opsiyonel, verilmezse activity_type'a göre hesaplanır
  multiplier?: number;
  metadata?: Record<string, any>;
}

export class AddLeaderboardScoreUseCase {
  constructor(private leaderboardRepository: ILeaderboardRepository) {}

  async execute(data: AddScoreDto): Promise<Result<void>> {
    try {
      // Get company to find program_id
      const company = await this.companyRepository.findById(data.companyId);
      if (!company) {
        return Result.fail(new AppError('Firma bulunamadı', 404));
      }

      // Calculate points if not provided
      const points = data.points || this.calculatePoints(data.activityType);

      // Add score using database function
      await this.leaderboardRepository.addScore({
        companyId: data.companyId,
        programId: company.programId,
        activityType: data.activityType,
        activityId: data.activityId || null,
        points,
        multiplier: data.multiplier || 1.0,
        metadata: data.metadata || null,
      });

      // Refresh leaderboard (async, don't wait)
      this.leaderboardRepository.refreshRankings().catch((error) => {
        console.error('Failed to refresh leaderboard:', error);
      });

      return Result.ok();
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Puan eklenemedi', 500)
      );
    }
  }

  private calculatePoints(activityType: string): number {
    const pointsMap: Record<string, number> = LEADERBOARD_POINTS;
    return pointsMap[activityType.toUpperCase()] || 0;
  }
}
```

---

### 4. Frontend Components

#### `src/1-presentation/components/features/leaderboard/LeaderboardTable.tsx`

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { Table } from '@/presentation/components/ui/molecules/table';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Avatar } from '@/presentation/components/ui/atoms/avatar';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface LeaderboardTableProps {
  programId: string;
}

export function LeaderboardTable({ programId }: LeaderboardTableProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard', programId],
    queryFn: async () => {
      const response = await fetch(`/api/leaderboard?programId=${programId}`);
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <Table>
      <thead>
        <tr>
          <th>Sıra</th>
          <th>Firma</th>
          <th>Toplam Puan</th>
          <th>Proje</th>
          <th>Eğitim</th>
          <th>Etkinlik</th>
          <th>Forum</th>
          <th>Haberler</th>
          <th>Rozetler</th>
          <th>Trend</th>
        </tr>
      </thead>
      <tbody>
        {data?.rankings.map((company: any) => (
          <tr key={company.companyId}>
            <td>
              <div className="flex items-center gap-2">
                {company.rank === 1 && '🥇'}
                {company.rank === 2 && '🥈'}
                {company.rank === 3 && '🥉'}
                {company.rank > 3 && company.rank}
              </div>
            </td>
            <td>
              <div className="flex items-center gap-2">
                <Avatar src={company.logoUrl} alt={company.companyName} />
                <span className="font-medium">{company.companyName}</span>
              </div>
            </td>
            <td>
              <span className="text-lg font-bold">{company.totalScore}</span>
            </td>
            <td>{company.projectScore}</td>
            <td>{company.trainingScore}</td>
            <td>{company.eventScore}</td>
            <td>{company.forumScore}</td>
            <td>{company.newsScore}</td>
            <td>
              <Badge variant="secondary">{company.badgeCount} rozet</Badge>
            </td>
            <td>
              {company.trend === 'up' && <TrendingUp className="text-green-500" />}
              {company.trend === 'down' && <TrendingDown className="text-red-500" />}
              {company.trend === 'stable' && <Minus className="text-gray-500" />}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
```

---

### 5. Entegrasyon: Mevcut Modüllere Ekleme

#### Sprint 8 (Proje Yönetimi) - Task Completed

`src/2-application/use-cases/task/CompleteTaskUseCase.ts`:

```typescript
// Mevcut use case'e eklenecek

async execute(taskId: string, userId: string): Promise<Result<void>> {
  // ... existing code ...

  // Add leaderboard score
  const isEarly = task.dueDate && new Date() < task.dueDate;
  const points = isEarly ? LEADERBOARD_POINTS.TASK_COMPLETED_EARLY : LEADERBOARD_POINTS.TASK_COMPLETED;

  await this.addLeaderboardScore.execute({
    companyId: task.companyId,
    activityType: 'task_completed',
    activityId: taskId,
    points,
    metadata: {
      taskTitle: task.title,
      projectId: task.projectId,
      completedEarly: isEarly,
    },
  });

  return Result.ok();
}
```

#### Sprint 9 (Eğitim) - Video Watched

`src/2-application/use-cases/training/RecordVideoProgressUseCase.ts`:

```typescript
// Mevcut use case'e eklenecek

async execute(data: RecordProgressDto): Promise<Result<void>> {
  // ... existing code ...

  // If video completed, add leaderboard score
  if (data.completed) {
    const videoDuration = video.duration; // minutes
    const points = videoDuration * LEADERBOARD_POINTS.VIDEO_WATCHED;

    await this.addLeaderboardScore.execute({
      companyId: user.companyId,
      activityType: 'video_watched',
      activityId: data.videoId,
      points,
      metadata: {
        videoTitle: video.title,
        duration: videoDuration,
      },
    });
  }

  return Result.ok();
}
```

_(Diğer modüller için benzer entegrasyonlar)_

---

## ✅ KABUL KRİTERLERİ

### Functional Requirements

1. ✅ **Puan Sistemi:**
   - Tüm aktiviteler otomatik puan olarak kaydedilmeli
   - Puanlar doğru hesaplanmalı
   - Multiplier çalışmalı

2. ✅ **Liderlik Tablosu:**
   - Program bazlı sıralama çalışmalı
   - Real-time güncelleme (1 dakikada bir)
   - Modül bazlı puan dağılımı görüntülenmeli

3. ✅ **Rozet Sistemi:**
   - Rozetler otomatik verilmeli
   - Bonus puanlar eklenmeli
   - Rozet galerisi görüntülenmeli

4. ✅ **Trend Analizi:**
   - Haftalık snapshot alınmalı
   - Trend grafiği görüntülenmeli
   - Geçmiş veriler saklanmalı

### Technical Requirements

1. ✅ Materialized view performanslı çalışmalı
2. ✅ Cron job (günlük refresh + haftalık snapshot)
3. ✅ RLS policies doğru çalışmalı
4. ✅ Database functions test edilmeli

---

## 🧪 TEST PLANI

### Unit Tests

- Points calculation
- Badge achievement logic

### Integration Tests

- Add score API
- Refresh rankings
- Badge awarding

### E2E Tests

- Leaderboard görüntüleme
- Puan kazanma flow
- Rozet kazanma flow

---

## 📊 CRON JOBS

### Vercel Cron Configuration

`vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/leaderboard/refresh",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/leaderboard/snapshot",
      "schedule": "0 0 * * 0"
    }
  ]
}
```

---

**Son Güncelleme:** 10 Kasım 2025  
**Durum:** 📋 Planlandı  
**Sonraki Sprint:** Sprint 15 - E-ticaret Metrikleri
