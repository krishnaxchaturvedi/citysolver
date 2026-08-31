/*
# AI Chat Conversations Table

## Overview
Stores AI assistant chat conversations for authenticated users.
Each conversation belongs to a user and contains messages with role (user/assistant),
content, and metadata. Conversations are isolated per user via RLS.

## 1. New Tables
- `chat_conversations` — stores conversation sessions per user
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users, defaults to auth.uid())
  - `role` (text — citizen, officer, or admin context)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
- `chat_messages` — individual messages within conversations
  - `id` (uuid, primary key)
  - `conversation_id` (uuid, references chat_conversations)
  - `role` (text — user or assistant)
  - `content` (text)
  - `error` (boolean, default false)
  - `created_at` (timestamptz)

## 2. Security (RLS)
- chat_conversations: owner read/insert/update/delete; admins read all
- chat_messages: scoped through parent conversation ownership
- Citizens can only access their own conversations
- Officers can only access their own conversations
- Admins can access all conversations for operational oversight

## 3. Indexes
- chat_conversations(user_id)
- chat_messages(conversation_id)
- chat_messages(created_at)
*/

-- ============ CHAT CONVERSATIONS ============

CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'officer', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_conversations" ON chat_conversations;
CREATE POLICY "select_own_conversations" ON chat_conversations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_conversations" ON chat_conversations;
CREATE POLICY "insert_own_conversations" ON chat_conversations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_conversations" ON chat_conversations;
CREATE POLICY "update_own_conversations" ON chat_conversations FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_conversations" ON chat_conversations;
CREATE POLICY "delete_own_conversations" ON chat_conversations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_select_all_conversations" ON chat_conversations;
CREATE POLICY "admin_select_all_conversations" ON chat_conversations FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ============ CHAT MESSAGES ============

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  error boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_chat_messages" ON chat_messages;
CREATE POLICY "select_own_chat_messages" ON chat_messages FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM chat_conversations c
      WHERE c.id = chat_messages.conversation_id
      AND (c.user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
    )
  );

DROP POLICY IF EXISTS "insert_own_chat_messages" ON chat_messages;
CREATE POLICY "insert_own_chat_messages" ON chat_messages FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_conversations c
      WHERE c.id = chat_messages.conversation_id AND c.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_own_chat_messages" ON chat_messages;
CREATE POLICY "delete_own_chat_messages" ON chat_messages FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM chat_conversations c
      WHERE c.id = chat_messages.conversation_id AND c.user_id = auth.uid()
    )
  );

-- ============ INDEXES ============

CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- ============ TRIGGER: updated_at ============

DROP TRIGGER IF EXISTS chat_conversations_updated_at ON chat_conversations;
CREATE TRIGGER chat_conversations_updated_at BEFORE UPDATE ON chat_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
