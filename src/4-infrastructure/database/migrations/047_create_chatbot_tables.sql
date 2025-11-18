-- Migration: Create Chatbot Tables
-- Description: Chatbot konuşmaları ve mesajları için tablolar
-- Date: 2025-11-17
-- Sprint: 25 - Chatbot

-- Chatbot Conversations Table
CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  title VARCHAR(255), -- İlk mesajdan otomatik oluşturulacak
  context JSONB DEFAULT '{}'::jsonb, -- Context bilgileri (role, current page, etc.)
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chatbot Messages Table
CREATE TABLE IF NOT EXISTS chatbot_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  intent VARCHAR(50), -- Detected intent (training, project, task, general, etc.)
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional metadata (training_id, project_id, etc.)
  tokens_used INTEGER DEFAULT 0,
  cost_usd DECIMAL(10, 6) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_user_id ON chatbot_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_company_id ON chatbot_conversations(company_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_program_id ON chatbot_conversations(program_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_last_message_at ON chatbot_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_conversation_id ON chatbot_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_role ON chatbot_messages(role);
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_intent ON chatbot_messages(intent);
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_created_at ON chatbot_messages(created_at DESC);

-- RLS Policies
ALTER TABLE chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_messages ENABLE ROW LEVEL SECURITY;

-- Users can only see their own conversations
CREATE POLICY chatbot_conversations_user_select ON chatbot_conversations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can create their own conversations
CREATE POLICY chatbot_conversations_user_insert ON chatbot_conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own conversations
CREATE POLICY chatbot_conversations_user_update ON chatbot_conversations
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own conversations
CREATE POLICY chatbot_conversations_user_delete ON chatbot_conversations
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Consultant can see conversations for their program companies
CREATE POLICY chatbot_conversations_consultant_select ON chatbot_conversations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_programs up
      WHERE up.user_id = auth.uid()
      AND up.program_id = chatbot_conversations.program_id
      AND up.is_active = true
      AND up.role_in_program IN ('consultant', 'program_manager')
    )
  );

-- Master admin has full access
CREATE POLICY chatbot_conversations_admin_all ON chatbot_conversations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'master_admin'
    )
  );

-- Messages: Users can only see messages from their conversations
CREATE POLICY chatbot_messages_user_select ON chatbot_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chatbot_conversations cc
      WHERE cc.id = chatbot_messages.conversation_id
      AND cc.user_id = auth.uid()
    )
  );

-- Users can insert messages to their conversations
CREATE POLICY chatbot_messages_user_insert ON chatbot_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chatbot_conversations cc
      WHERE cc.id = chatbot_messages.conversation_id
      AND cc.user_id = auth.uid()
    )
  );

-- Consultant can see messages from their program conversations
CREATE POLICY chatbot_messages_consultant_select ON chatbot_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chatbot_conversations cc
      JOIN user_programs up ON up.program_id = cc.program_id
      WHERE cc.id = chatbot_messages.conversation_id
      AND up.user_id = auth.uid()
      AND up.is_active = true
      AND up.role_in_program IN ('consultant', 'program_manager')
    )
  );

-- Master admin has full access
CREATE POLICY chatbot_messages_admin_all ON chatbot_messages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'master_admin'
    )
  );

-- Function to update conversation last_message_at and message_count
CREATE OR REPLACE FUNCTION update_chatbot_conversation_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chatbot_conversations
  SET
    last_message_at = NEW.created_at,
    message_count = message_count + 1,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation stats when message is inserted
CREATE TRIGGER chatbot_messages_update_conversation_stats
  AFTER INSERT ON chatbot_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chatbot_conversation_stats();

-- Function to auto-generate conversation title from first user message
CREATE OR REPLACE FUNCTION generate_chatbot_conversation_title()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update title if it's null and this is the first user message
  IF NEW.role = 'user' AND NEW.conversation_id IS NOT NULL THEN
    UPDATE chatbot_conversations
    SET title = LEFT(NEW.content, 50) -- First 50 characters
    WHERE id = NEW.conversation_id
    AND title IS NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate title
CREATE TRIGGER chatbot_messages_generate_title
  AFTER INSERT ON chatbot_messages
  FOR EACH ROW
  WHEN (NEW.role = 'user')
  EXECUTE FUNCTION generate_chatbot_conversation_title();

-- Comments
COMMENT ON TABLE chatbot_conversations IS 'Chatbot konuşmaları';
COMMENT ON COLUMN chatbot_conversations.context IS 'Context bilgileri (role, current page, program info, etc.)';
COMMENT ON COLUMN chatbot_conversations.title IS 'Konuşma başlığı (ilk mesajdan otomatik oluşturulur)';
COMMENT ON TABLE chatbot_messages IS 'Chatbot mesajları';
COMMENT ON COLUMN chatbot_messages.intent IS 'Tespit edilen intent (training, project, task, general, etc.)';
COMMENT ON COLUMN chatbot_messages.metadata IS 'Ek metadata (training_id, project_id, links, etc.)';

