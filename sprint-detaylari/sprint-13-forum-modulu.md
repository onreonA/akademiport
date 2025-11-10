# 💬 Sprint 13: Forum Modülü

**Durum:** 📋 Planlandı  
**Tahmini Başlangıç:** 17 Kasım 2025  
**Tahmini Bitiş:** 24 Kasım 2025  
**Süre:** 1 hafta  
**Bağımlılıklar:** Sprint 6 (Company Management), Sprint 7 (Consultant Panel)

---

## 🎯 SPRINT HEDEF

Forum sistemi + Liderlik tablosu entegrasyonu + AI moderasyon hazırlığı

**Ana Hedefler:**

1. ✅ Kategori sistemi (Admin oluşturur)
2. ✅ Konu oluşturma ve yanıt sistemi (nested)
3. ✅ Beğeni sistemi
4. ✅ Çözüm işaretleme (best answer)
5. ✅ Moderasyon (Consultant)
6. ✅ Bildirim sistemi
7. ✅ Liderlik tablosu entegrasyonu

---

## 📦 KAPSAM

### 1. Database Layer

#### Migration: `033_create_forum_tables.sql`

```sql
-- =====================================================
-- FORUM MODULE TABLES
-- =====================================================

-- Topic Status Enum
CREATE TYPE topic_status AS ENUM (
  'open',              -- Açık
  'closed',            -- Kapalı
  'solved',            -- Çözüldü
  'archived'           -- Arşivlendi
);

-- Topic Priority Enum
CREATE TYPE topic_priority AS ENUM (
  'low',               -- Düşük
  'normal',            -- Normal
  'high',              -- Yüksek
  'urgent'             -- Acil
);

-- =====================================================
-- FORUM CATEGORIES TABLE
-- =====================================================
CREATE TABLE forum_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Program ilişkisi
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,

  -- Kategori bilgileri
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100),              -- Icon name (lucide-react)
  color VARCHAR(50),              -- Hex color code

  -- Sıralama
  order_index INTEGER DEFAULT 0,

  -- Özellikler
  is_active BOOLEAN DEFAULT TRUE,
  require_approval BOOLEAN DEFAULT FALSE, -- Yeni konular onay gerektirir mi?

  -- İstatistikler
  topic_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),

  UNIQUE(program_id, slug)
);

-- =====================================================
-- FORUM TOPICS TABLE
-- =====================================================
CREATE TABLE forum_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- İlişkiler
  category_id UUID NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,

  -- Konu bilgileri
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,

  -- Durum ve öncelik
  status topic_status DEFAULT 'open',
  priority topic_priority DEFAULT 'normal',

  -- Özellikler
  is_pinned BOOLEAN DEFAULT FALSE,        -- Sabitlenmiş konu
  is_locked BOOLEAN DEFAULT FALSE,        -- Kilitli (yanıt yazılamaz)
  is_approved BOOLEAN DEFAULT TRUE,       -- Onaylanmış

  -- Çözüm
  solution_reply_id UUID,                 -- Çözüm olarak işaretlenen yanıt
  solved_at TIMESTAMP WITH TIME ZONE,
  solved_by UUID REFERENCES users(id),

  -- İstatistikler
  view_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,

  -- Son aktivite
  last_reply_at TIMESTAMP WITH TIME ZONE,
  last_reply_by UUID REFERENCES users(id),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(program_id, slug),
  CONSTRAINT valid_view_count CHECK (view_count >= 0),
  CONSTRAINT valid_reply_count CHECK (reply_count >= 0),
  CONSTRAINT valid_like_count CHECK (like_count >= 0)
);

-- =====================================================
-- FORUM REPLIES TABLE
-- =====================================================
CREATE TABLE forum_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- İlişkiler
  topic_id UUID NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE, -- İç içe yanıtlar

  -- Yanıt içeriği
  content TEXT NOT NULL,

  -- Özellikler
  is_approved BOOLEAN DEFAULT TRUE,
  is_edited BOOLEAN DEFAULT FALSE,
  is_solution BOOLEAN DEFAULT FALSE,      -- Bu yanıt çözüm mü?

  -- İstatistikler
  like_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_content CHECK (LENGTH(content) > 0),
  CONSTRAINT valid_like_count CHECK (like_count >= 0)
);

-- =====================================================
-- FORUM LIKES TABLE
-- =====================================================
CREATE TABLE forum_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- İlişkiler (topic veya reply)
  topic_id UUID REFERENCES forum_topics(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- En az birisi olmalı
  CONSTRAINT like_target CHECK (
    (topic_id IS NOT NULL AND reply_id IS NULL) OR
    (topic_id IS NULL AND reply_id IS NOT NULL)
  ),

  -- Aynı kullanıcı aynı şeyi birden fazla beğenemez
  UNIQUE(topic_id, user_id),
  UNIQUE(reply_id, user_id)
);

-- =====================================================
-- FORUM NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE forum_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- İlişkiler
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES forum_topics(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,

  -- Bildirim tipi
  type VARCHAR(50) NOT NULL,              -- 'new_reply', 'solution_marked', 'topic_closed', etc.

  -- Bildirim içeriği
  title VARCHAR(255) NOT NULL,
  message TEXT,

  -- Durum
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FORUM ACTIVITY TABLE (Liderlik tablosu için)
-- =====================================================
CREATE TABLE forum_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- İlişkiler
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,

  -- Aktivite tipi
  activity_type VARCHAR(50) NOT NULL,    -- 'topic_created', 'reply_created', 'solution_marked'

  -- İlişkili kayıtlar
  topic_id UUID REFERENCES forum_topics(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,

  -- Puan
  points INTEGER NOT NULL DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Categories indexes
CREATE INDEX idx_forum_categories_program ON forum_categories(program_id);
CREATE INDEX idx_forum_categories_active ON forum_categories(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_forum_categories_order ON forum_categories(order_index);

-- Topics indexes
CREATE INDEX idx_forum_topics_category ON forum_topics(category_id);
CREATE INDEX idx_forum_topics_program ON forum_topics(program_id);
CREATE INDEX idx_forum_topics_author ON forum_topics(author_id);
CREATE INDEX idx_forum_topics_company ON forum_topics(company_id);
CREATE INDEX idx_forum_topics_status ON forum_topics(status);
CREATE INDEX idx_forum_topics_pinned ON forum_topics(is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX idx_forum_topics_slug ON forum_topics(slug);
CREATE INDEX idx_forum_topics_last_reply ON forum_topics(last_reply_at DESC);
CREATE INDEX idx_forum_topics_created ON forum_topics(created_at DESC);

-- Full-text search index
CREATE INDEX idx_forum_topics_search ON forum_topics USING gin(
  to_tsvector('turkish', title || ' ' || content)
);

-- Replies indexes
CREATE INDEX idx_forum_replies_topic ON forum_replies(topic_id);
CREATE INDEX idx_forum_replies_author ON forum_replies(author_id);
CREATE INDEX idx_forum_replies_parent ON forum_replies(parent_id);
CREATE INDEX idx_forum_replies_created ON forum_replies(created_at DESC);
CREATE INDEX idx_forum_replies_solution ON forum_replies(is_solution) WHERE is_solution = TRUE;

-- Likes indexes
CREATE INDEX idx_forum_likes_topic ON forum_likes(topic_id);
CREATE INDEX idx_forum_likes_reply ON forum_likes(reply_id);
CREATE INDEX idx_forum_likes_user ON forum_likes(user_id);

-- Notifications indexes
CREATE INDEX idx_forum_notifications_user ON forum_notifications(user_id);
CREATE INDEX idx_forum_notifications_unread ON forum_notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_forum_notifications_created ON forum_notifications(created_at DESC);

-- Activity indexes
CREATE INDEX idx_forum_activity_user ON forum_activity(user_id);
CREATE INDEX idx_forum_activity_company ON forum_activity(company_id);
CREATE INDEX idx_forum_activity_program ON forum_activity(program_id);
CREATE INDEX idx_forum_activity_type ON forum_activity(activity_type);
CREATE INDEX idx_forum_activity_created ON forum_activity(created_at DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_forum_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_forum_categories_updated_at
  BEFORE UPDATE ON forum_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_forum_updated_at();

CREATE TRIGGER trigger_forum_topics_updated_at
  BEFORE UPDATE ON forum_topics
  FOR EACH ROW
  EXECUTE FUNCTION update_forum_updated_at();

CREATE TRIGGER trigger_forum_replies_updated_at
  BEFORE UPDATE ON forum_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_forum_updated_at();

-- Update category topic count
CREATE OR REPLACE FUNCTION update_category_topic_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_categories SET topic_count = topic_count + 1 WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_categories SET topic_count = topic_count - 1 WHERE id = OLD.category_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.category_id != NEW.category_id THEN
    UPDATE forum_categories SET topic_count = topic_count - 1 WHERE id = OLD.category_id;
    UPDATE forum_categories SET topic_count = topic_count + 1 WHERE id = NEW.category_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_category_topic_count
  AFTER INSERT OR DELETE OR UPDATE ON forum_topics
  FOR EACH ROW
  EXECUTE FUNCTION update_category_topic_count();

-- Update topic reply count
CREATE OR REPLACE FUNCTION update_topic_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_topics
    SET
      reply_count = reply_count + 1,
      last_reply_at = NEW.created_at,
      last_reply_by = NEW.author_id
    WHERE id = NEW.topic_id;

    -- Update category reply count
    UPDATE forum_categories
    SET reply_count = reply_count + 1
    WHERE id = (SELECT category_id FROM forum_topics WHERE id = NEW.topic_id);

  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_topics
    SET reply_count = reply_count - 1
    WHERE id = OLD.topic_id;

    -- Update category reply count
    UPDATE forum_categories
    SET reply_count = reply_count - 1
    WHERE id = (SELECT category_id FROM forum_topics WHERE id = OLD.topic_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_topic_reply_count
  AFTER INSERT OR DELETE ON forum_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_topic_reply_count();

-- Update topic like count
CREATE OR REPLACE FUNCTION update_topic_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.topic_id IS NOT NULL THEN
    UPDATE forum_topics SET like_count = like_count + 1 WHERE id = NEW.topic_id;
  ELSIF TG_OP = 'DELETE' AND OLD.topic_id IS NOT NULL THEN
    UPDATE forum_topics SET like_count = like_count - 1 WHERE id = OLD.topic_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_topic_like_count
  AFTER INSERT OR DELETE ON forum_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_topic_like_count();

-- Update reply like count
CREATE OR REPLACE FUNCTION update_reply_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.reply_id IS NOT NULL THEN
    UPDATE forum_replies SET like_count = like_count + 1 WHERE id = NEW.reply_id;
  ELSIF TG_OP = 'DELETE' AND OLD.reply_id IS NOT NULL THEN
    UPDATE forum_replies SET like_count = like_count - 1 WHERE id = OLD.reply_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reply_like_count
  AFTER INSERT OR DELETE ON forum_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_reply_like_count();

-- Record forum activity for leaderboard
CREATE OR REPLACE FUNCTION record_forum_activity()
RETURNS TRIGGER AS $$
DECLARE
  v_company_id UUID;
  v_program_id UUID;
  v_points INTEGER;
  v_activity_type VARCHAR(50);
BEGIN
  IF TG_TABLE_NAME = 'forum_topics' AND TG_OP = 'INSERT' THEN
    v_company_id := NEW.company_id;
    v_program_id := NEW.program_id;
    v_points := 10; -- Konu açma: +10 puan
    v_activity_type := 'topic_created';

    INSERT INTO forum_activity (user_id, company_id, program_id, activity_type, topic_id, points)
    VALUES (NEW.author_id, v_company_id, v_program_id, v_activity_type, NEW.id, v_points);

  ELSIF TG_TABLE_NAME = 'forum_replies' AND TG_OP = 'INSERT' THEN
    -- Get company_id and program_id from topic
    SELECT t.company_id, t.program_id INTO v_company_id, v_program_id
    FROM forum_topics t WHERE t.id = NEW.topic_id;

    v_points := 5; -- Yanıt yazma: +5 puan
    v_activity_type := 'reply_created';

    INSERT INTO forum_activity (user_id, company_id, program_id, activity_type, topic_id, reply_id, points)
    VALUES (NEW.author_id, v_company_id, v_program_id, v_activity_type, NEW.topic_id, NEW.id, v_points);

  ELSIF TG_TABLE_NAME = 'forum_replies' AND TG_OP = 'UPDATE' AND NEW.is_solution = TRUE AND OLD.is_solution = FALSE THEN
    -- Get company_id and program_id from topic
    SELECT t.company_id, t.program_id INTO v_company_id, v_program_id
    FROM forum_topics t WHERE t.id = NEW.topic_id;

    v_points := 20; -- Çözüm işaretlenme: +20 puan
    v_activity_type := 'solution_marked';

    INSERT INTO forum_activity (user_id, company_id, program_id, activity_type, topic_id, reply_id, points)
    VALUES (NEW.author_id, v_company_id, v_program_id, v_activity_type, NEW.topic_id, NEW.id, v_points);
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_record_topic_activity
  AFTER INSERT ON forum_topics
  FOR EACH ROW
  EXECUTE FUNCTION record_forum_activity();

CREATE TRIGGER trigger_record_reply_activity
  AFTER INSERT OR UPDATE ON forum_replies
  FOR EACH ROW
  EXECUTE FUNCTION record_forum_activity();

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_activity ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Admin can manage categories"
  ON forum_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('master_admin', 'consultant')
    )
  );

CREATE POLICY "Users can view active categories in their program"
  ON forum_categories FOR SELECT
  USING (
    is_active = TRUE
    AND EXISTS (
      SELECT 1 FROM users
      JOIN companies ON companies.id = users.company_id
      WHERE users.id = auth.uid()
      AND companies.program_id = forum_categories.program_id
    )
  );

-- Topics policies
CREATE POLICY "Admin can manage all topics"
  ON forum_topics FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('master_admin', 'consultant')
    )
  );

CREATE POLICY "Users can view approved topics in their program"
  ON forum_topics FOR SELECT
  USING (
    is_approved = TRUE
    AND EXISTS (
      SELECT 1 FROM users
      JOIN companies ON companies.id = users.company_id
      WHERE users.id = auth.uid()
      AND companies.program_id = forum_topics.program_id
    )
  );

CREATE POLICY "Users can create topics"
  ON forum_topics FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM users
      JOIN companies ON companies.id = users.company_id
      WHERE users.id = auth.uid()
      AND companies.program_id = forum_topics.program_id
    )
  );

CREATE POLICY "Users can update their own topics"
  ON forum_topics FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own topics"
  ON forum_topics FOR DELETE
  USING (auth.uid() = author_id);

-- Replies policies
CREATE POLICY "Users can view approved replies"
  ON forum_replies FOR SELECT
  USING (is_approved = TRUE);

CREATE POLICY "Users can create replies"
  ON forum_replies FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own replies"
  ON forum_replies FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own replies"
  ON forum_replies FOR DELETE
  USING (auth.uid() = author_id);

-- Likes policies
CREATE POLICY "Users can view all likes"
  ON forum_likes FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can create likes"
  ON forum_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON forum_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON forum_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON forum_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Activity policies
CREATE POLICY "Admin can view all activity"
  ON forum_activity FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('master_admin', 'consultant')
    )
  );

-- =====================================================
-- SEED DATA (Optional)
-- =====================================================

-- Sample categories (will be created by admin)
-- INSERT INTO forum_categories (program_id, name, slug, description, icon, color, order_index)
-- VALUES
--   (<program_id>, 'Genel', 'genel', 'Genel konular', 'MessageSquare', '#3B82F6', 1),
--   (<program_id>, 'E-ticaret', 'e-ticaret', 'E-ticaret ile ilgili sorular', 'ShoppingCart', '#10B981', 2),
--   (<program_id>, 'E-ihracat', 'e-ihracat', 'E-ihracat süreçleri', 'Globe', '#F59E0B', 3),
--   (<program_id>, 'Teknik Destek', 'teknik-destek', 'Platform kullanımı', 'HelpCircle', '#EF4444', 4);
```

---

### 2. Domain Layer

#### `src/3-domain/enums/ForumEnums.ts`

```typescript
/**
 * Topic Status Enum
 */
export enum TopicStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  SOLVED = 'solved',
  ARCHIVED = 'archived',
}

export const TOPIC_STATUS_LABELS: Record<TopicStatus, string> = {
  [TopicStatus.OPEN]: 'Açık',
  [TopicStatus.CLOSED]: 'Kapalı',
  [TopicStatus.SOLVED]: 'Çözüldü',
  [TopicStatus.ARCHIVED]: 'Arşivlendi',
};

/**
 * Topic Priority Enum
 */
export enum TopicPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export const TOPIC_PRIORITY_LABELS: Record<TopicPriority, string> = {
  [TopicPriority.LOW]: 'Düşük',
  [TopicPriority.NORMAL]: 'Normal',
  [TopicPriority.HIGH]: 'Yüksek',
  [TopicPriority.URGENT]: 'Acil',
};
```

#### `src/3-domain/entities/Forum.ts`

```typescript
import { TopicStatus, TopicPriority } from '../enums/ForumEnums';

export interface ForumCategory {
  id: string;
  programId: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  orderIndex: number;
  isActive: boolean;
  requireApproval: boolean;
  topicCount: number;
  replyCount: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
}

export interface ForumTopic {
  id: string;
  categoryId: string;
  programId: string;
  authorId: string;
  companyId: string | null;
  title: string;
  slug: string;
  content: string;
  status: TopicStatus;
  priority: TopicPriority;
  isPinned: boolean;
  isLocked: boolean;
  isApproved: boolean;
  solutionReplyId: string | null;
  solvedAt: Date | null;
  solvedBy: string | null;
  viewCount: number;
  replyCount: number;
  likeCount: number;
  lastReplyAt: Date | null;
  lastReplyBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ForumReply {
  id: string;
  topicId: string;
  authorId: string;
  companyId: string | null;
  parentId: string | null;
  content: string;
  isApproved: boolean;
  isEdited: boolean;
  isSolution: boolean;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ForumLike {
  id: string;
  topicId: string | null;
  replyId: string | null;
  userId: string;
  createdAt: Date;
}

export interface ForumNotification {
  id: string;
  userId: string;
  topicId: string | null;
  replyId: string | null;
  type: string;
  title: string;
  message: string | null;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
}

/**
 * Forum Topic Entity with Business Logic
 */
export class ForumTopicEntity implements ForumTopic {
  id: string;
  categoryId: string;
  programId: string;
  authorId: string;
  companyId: string | null;
  title: string;
  slug: string;
  content: string;
  status: TopicStatus;
  priority: TopicPriority;
  isPinned: boolean;
  isLocked: boolean;
  isApproved: boolean;
  solutionReplyId: string | null;
  solvedAt: Date | null;
  solvedBy: string | null;
  viewCount: number;
  replyCount: number;
  likeCount: number;
  lastReplyAt: Date | null;
  lastReplyBy: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: ForumTopic) {
    Object.assign(this, data);
  }

  /**
   * Konu açık mı?
   */
  isOpen(): boolean {
    return this.status === TopicStatus.OPEN && !this.isLocked;
  }

  /**
   * Konu çözüldü mü?
   */
  isSolved(): boolean {
    return this.status === TopicStatus.SOLVED && !!this.solutionReplyId;
  }

  /**
   * Konuyu kapat
   */
  close(userId: string): void {
    this.status = TopicStatus.CLOSED;
    this.touch();
  }

  /**
   * Konuyu aç
   */
  open(): void {
    this.status = TopicStatus.OPEN;
    this.touch();
  }

  /**
   * Konuyu kilitle
   */
  lock(): void {
    this.isLocked = true;
    this.touch();
  }

  /**
   * Kilit aç
   */
  unlock(): void {
    this.isLocked = false;
    this.touch();
  }

  /**
   * Sabitle
   */
  pin(): void {
    this.isPinned = true;
    this.touch();
  }

  /**
   * Sabitlemeyi kaldır
   */
  unpin(): void {
    this.isPinned = false;
    this.touch();
  }

  /**
   * Çözümü işaretle
   */
  markSolution(replyId: string, userId: string): void {
    this.solutionReplyId = replyId;
    this.solvedAt = new Date();
    this.solvedBy = userId;
    this.status = TopicStatus.SOLVED;
    this.touch();
  }

  /**
   * Çözüm işaretini kaldır
   */
  unmarkSolution(): void {
    this.solutionReplyId = null;
    this.solvedAt = null;
    this.solvedBy = null;
    this.status = TopicStatus.OPEN;
    this.touch();
  }

  /**
   * Yanıt yazılabilir mi?
   */
  canReply(): boolean {
    return this.isOpen() && this.isApproved;
  }

  /**
   * updatedAt'i güncelle
   */
  private touch(): void {
    this.updatedAt = new Date();
  }

  /**
   * Validation
   */
  static validate(data: Partial<ForumTopic>): string[] {
    const errors: string[] = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Konu başlığı gereklidir');
    }

    if (data.title && data.title.length > 500) {
      errors.push('Konu başlığı 500 karakterden uzun olamaz');
    }

    if (!data.content || data.content.trim().length === 0) {
      errors.push('Konu içeriği gereklidir');
    }

    if (!data.categoryId) {
      errors.push('Kategori gereklidir');
    }

    if (!data.programId) {
      errors.push('Program ID gereklidir');
    }

    if (!data.authorId) {
      errors.push('Yazar ID gereklidir');
    }

    return errors;
  }
}
```

---

### 3. Application Layer

#### Use Cases (Örnekler)

`src/2-application/use-cases/forum/CreateTopicUseCase.ts`:

```typescript
import { IForumRepository } from '@/domain/interfaces/repositories/IForumRepository';
import { CreateTopicDto } from '@/application/dto/forum/CreateTopicDto';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';
import { ForumTopicEntity } from '@/domain/entities/Forum';
import { TopicStatus, TopicPriority } from '@/domain/enums/ForumEnums';

export class CreateTopicUseCase {
  constructor(private forumRepository: IForumRepository) {}

  async execute(
    data: CreateTopicDto,
    userId: string,
    companyId: string
  ): Promise<Result<{ id: string }>> {
    try {
      // Validation
      const validationErrors = ForumTopicEntity.validate({
        ...data,
        authorId: userId,
        status: TopicStatus.OPEN,
        priority: data.priority || TopicPriority.NORMAL,
      });

      if (validationErrors.length > 0) {
        return Result.fail(new AppError(validationErrors.join(', '), 400));
      }

      // Check if category exists and is active
      const category = await this.forumRepository.findCategoryById(data.categoryId);
      if (!category || !category.isActive) {
        return Result.fail(new AppError('Kategori bulunamadı veya aktif değil', 404));
      }

      // Generate slug
      const slug = this.generateSlug(data.title);

      // Check if slug exists
      const existingTopic = await this.forumRepository.findTopicBySlug(data.programId, slug);
      if (existingTopic) {
        return Result.fail(new AppError('Bu başlıkta bir konu zaten mevcut', 400));
      }

      // Create topic
      const topic = await this.forumRepository.createTopic({
        ...data,
        slug,
        authorId: userId,
        companyId,
        status: TopicStatus.OPEN,
        priority: data.priority || TopicPriority.NORMAL,
        isApproved: !category.requireApproval, // Onay gerekiyorsa false
      });

      return Result.ok({ id: topic.id });
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Konu oluşturulamadı', 500)
      );
    }
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
```

`src/2-application/use-cases/forum/MarkSolutionUseCase.ts`:

```typescript
import { IForumRepository } from '@/domain/interfaces/repositories/IForumRepository';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';
import { ForumTopicEntity } from '@/domain/entities/Forum';

export class MarkSolutionUseCase {
  constructor(private forumRepository: IForumRepository) {}

  async execute(topicId: string, replyId: string, userId: string): Promise<Result<void>> {
    try {
      // Get topic
      const topic = await this.forumRepository.findTopicById(topicId);
      if (!topic) {
        return Result.fail(new AppError('Konu bulunamadı', 404));
      }

      // Check if user is author or consultant
      const user = await this.userRepository.findById(userId);
      const isAuthor = topic.authorId === userId;
      const isConsultant = user?.role === 'consultant' || user?.role === 'master_admin';

      if (!isAuthor && !isConsultant) {
        return Result.fail(
          new AppError('Sadece konu sahibi veya danışman çözüm işaretleyebilir', 403)
        );
      }

      // Check if reply exists
      const reply = await this.forumRepository.findReplyById(replyId);
      if (!reply || reply.topicId !== topicId) {
        return Result.fail(new AppError('Yanıt bulunamadı', 404));
      }

      // Mark solution
      const topicEntity = new ForumTopicEntity(topic);
      topicEntity.markSolution(replyId, userId);

      // Update topic
      await this.forumRepository.updateTopic(topicId, {
        solutionReplyId: topicEntity.solutionReplyId,
        solvedAt: topicEntity.solvedAt,
        solvedBy: topicEntity.solvedBy,
        status: topicEntity.status,
      });

      // Update reply
      await this.forumRepository.updateReply(replyId, {
        isSolution: true,
      });

      // Create notification for reply author
      await this.forumRepository.createNotification({
        userId: reply.authorId,
        topicId,
        replyId,
        type: 'solution_marked',
        title: 'Yanıtınız çözüm olarak işaretlendi',
        message: `"${topic.title}" konusundaki yanıtınız çözüm olarak işaretlendi. +20 puan kazandınız!`,
      });

      return Result.ok();
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Çözüm işaretlenemedi', 500)
      );
    }
  }
}
```

_(Diğer use case'ler: ReplyTopicUseCase, LikeTopicUseCase, CloseTopicUseCase, PinTopicUseCase, ListTopicsUseCase)_

---

### 4. Frontend Components (Örnekler)

#### `src/1-presentation/components/features/forum/TopicList.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TopicCard } from './TopicCard';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Input } from '@/presentation/components/ui/atoms/input';
import { Select } from '@/presentation/components/ui/molecules/select';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Skeleton } from '@/presentation/components/ui/atoms/skeleton';

interface TopicListProps {
  programId: string;
  categoryId?: string;
}

export function TopicList({ programId, categoryId }: TopicListProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryId || 'all');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['forum-topics', { programId, categoryId: selectedCategory, search, page }],
    queryFn: async () => {
      const params = new URLSearchParams({
        programId,
        page: page.toString(),
        limit: '20',
      });

      if (selectedCategory !== 'all') params.append('categoryId', selectedCategory);
      if (search) params.append('search', search);

      const response = await fetch(`/api/forum/topics?${params}`);
      if (!response.ok) throw new Error('Failed to fetch topics');
      return response.json();
    },
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Konu ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select
          value={selectedCategory}
          onValueChange={setSelectedCategory}
        >
          <option value="all">Tüm Kategoriler</option>
          {/* Category options */}
        </Select>
      </div>

      {/* Topics */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {data?.topics.map((topic: any) => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>

          {/* Pagination */}
          {data && data.total > 20 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Önceki
              </Button>
              <span className="flex items-center px-4">
                Sayfa {page} / {Math.ceil(data.total / 20)}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(data.total / 20)}
              >
                Sonraki
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

---

## 📊 LIDERLIK TABLOSU ENTEGRASYONU

### Puan Sistemi

| Aktivite          | Puan     | Trigger                                      |
| ----------------- | -------- | -------------------------------------------- |
| Konu açma         | +10 puan | `forum_topics` tablosuna kayıt eklendiğinde  |
| Yanıt yazma       | +5 puan  | `forum_replies` tablosuna kayıt eklendiğinde |
| Çözüm işaretlenme | +20 puan | `forum_replies.is_solution = true` olduğunda |

---

## ✅ KABUL KRİTERLERİ

### Functional Requirements

1. ✅ **Admin:**
   - Kategori oluşturabilmeli
   - Tüm konuları görebilmeli
   - Moderasyon yapabilmeli (pin, close, delete)

2. ✅ **Consultant:**
   - Moderasyon yapabilmeli
   - Çözüm işaretleyebilmeli

3. ✅ **Company User:**
   - Konu açabilmeli
   - Yanıt yazabilmeli
   - Beğenebilmeli
   - Çözüm işaretleyebilmeli (kendi konusunda)

4. ✅ **Liderlik Tablosu:**
   - Aktiviteler puan olarak kaydedilmeli

---

## 🧪 TEST PLANI

### Unit Tests

- ForumTopicEntity business logic
- Use case validations

### Integration Tests

- API routes
- Repository methods
- RLS policies

### E2E Tests

- Konu oluşturma flow
- Yanıt yazma flow
- Çözüm işaretleme flow

---

**Son Güncelleme:** 10 Kasım 2025  
**Durum:** 📋 Planlandı  
**Sonraki Sprint:** Sprint 14 - Liderlik Tablosu
