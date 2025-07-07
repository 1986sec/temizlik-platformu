-- Messaging system
-- Create conversations table
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  participant2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES job_postings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(participant1_id, participant2_id, job_id)
);

-- Create messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image')),
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversation participants view for easier querying
CREATE VIEW conversation_participants AS
SELECT 
  c.id as conversation_id,
  c.job_id,
  c.created_at as conversation_created_at,
  c.updated_at as conversation_updated_at,
  p1.id as participant1_id,
  p1.first_name as participant1_first_name,
  p1.last_name as participant1_last_name,
  p1.profile_photo_url as participant1_photo,
  p2.id as participant2_id,
  p2.first_name as participant2_first_name,
  p2.last_name as participant2_last_name,
  p2.profile_photo_url as participant2_photo,
  j.title as job_title,
  comp.name as company_name
FROM conversations c
JOIN profiles p1 ON c.participant1_id = p1.id
JOIN profiles p2 ON c.participant2_id = p2.id
LEFT JOIN job_postings j ON c.job_id = j.id
LEFT JOIN companies comp ON j.company_id = comp.id;

-- Add RLS policies for conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view conversations they participate in" ON conversations
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE id IN (participant1_id, participant2_id)
    )
  );

CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE id IN (participant1_id, participant2_id)
    )
  );

CREATE POLICY "Users can update conversations they participate in" ON conversations
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE id IN (participant1_id, participant2_id)
    )
  );

-- Add RLS policies for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE id IN (
        SELECT participant1_id FROM conversations WHERE id = conversation_id
        UNION
        SELECT participant2_id FROM conversations WHERE id = conversation_id
      )
    )
  );

CREATE POLICY "Users can send messages in their conversations" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE id = sender_id
    )
  );

CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE id = sender_id
    )
  );

-- Create function to update conversation timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET updated_at = NOW() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update conversation timestamp when message is sent
CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Create function to get unread message count
CREATE OR REPLACE FUNCTION get_unread_message_count(user_profile_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM messages m
    JOIN conversations c ON m.conversation_id = c.id
    WHERE m.is_read = FALSE 
    AND m.sender_id != user_profile_id
    AND (
      c.participant1_id = user_profile_id OR 
      c.participant2_id = user_profile_id
    )
  );
END;
$$ LANGUAGE plpgsql; 