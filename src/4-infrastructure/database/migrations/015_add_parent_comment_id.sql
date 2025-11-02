-- =====================================================
-- ADD PARENT_COMMENT_ID TO TASK_COMMENTS
-- =====================================================
-- Sorulara cevap verme özelliği için parent_comment_id alanı ekleniyor
-- Bir yorum bir başka yorumun (soru) cevabı olabilir

-- parent_comment_id alanını ekle
ALTER TABLE task_comments
ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES task_comments(id) ON DELETE CASCADE;

-- Index ekle (cevapları bulmak için)
CREATE INDEX IF NOT EXISTS idx_task_comments_parent_id ON task_comments(parent_comment_id);

-- Self-referential foreign key constraint (bir yorum kendisine parent olamaz)
ALTER TABLE task_comments
ADD CONSTRAINT check_no_self_reference CHECK (parent_comment_id != id);

-- Comments
COMMENT ON COLUMN task_comments.parent_comment_id IS 'Eğer bu yorum bir soruya cevap ise, parent comment ID. NULL ise normal yorum veya soru.';

