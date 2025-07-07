-- Notification system
-- Create notifications table
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (
    notification_type IN (
      'application_received',
      'application_status_changed',
      'new_message',
      'job_approved',
      'job_rejected',
      'payment_approved',
      'payment_rejected',
      'profile_approved',
      'profile_rejected',
      'system_announcement'
    )
  ),
  related_job_id UUID REFERENCES job_postings(id) ON DELETE CASCADE,
  related_application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  related_conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  is_email_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification preferences table
CREATE TABLE notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  application_updates BOOLEAN DEFAULT TRUE,
  new_messages BOOLEAN DEFAULT TRUE,
  job_updates BOOLEAN DEFAULT TRUE,
  system_announcements BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE id = notifications.user_id
    )
  );

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE id = notifications.user_id
    )
  );

-- Add RLS policies for notification preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notification preferences" ON notification_preferences
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE id = notification_preferences.user_id
    )
  );

CREATE POLICY "Users can update their own notification preferences" ON notification_preferences
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE id = notification_preferences.user_id
    )
  );

CREATE POLICY "Users can insert their own notification preferences" ON notification_preferences
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE id = notification_preferences.user_id
    )
  );

-- Create function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_notification_type TEXT,
  p_related_job_id UUID DEFAULT NULL,
  p_related_application_id UUID DEFAULT NULL,
  p_related_conversation_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    title,
    message,
    notification_type,
    related_job_id,
    related_application_id,
    related_conversation_id
  ) VALUES (
    p_user_id,
    p_title,
    p_message,
    p_notification_type,
    p_related_job_id,
    p_related_application_id,
    p_related_conversation_id
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_as_read(p_user_id UUID, p_notification_ids UUID[] DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  IF p_notification_ids IS NULL THEN
    UPDATE notifications 
    SET is_read = TRUE 
    WHERE user_id = p_user_id AND is_read = FALSE;
  ELSE
    UPDATE notifications 
    SET is_read = TRUE 
    WHERE user_id = p_user_id AND id = ANY(p_notification_ids);
  END IF;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM notifications
    WHERE user_id = p_user_id AND is_read = FALSE
  );
END;
$$ LANGUAGE plpgsql;

-- Create trigger to create notification preferences when profile is created
CREATE OR REPLACE FUNCTION create_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_notification_preferences_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_notification_preferences();

-- Create function to clean up old notifications (older than 30 days)
CREATE OR REPLACE FUNCTION clean_old_notifications()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM notifications 
  WHERE created_at < NOW() - INTERVAL '30 days' AND is_read = TRUE;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create a cron job to clean old notifications (runs daily at 2 AM)
SELECT cron.schedule('clean-old-notifications', '0 2 * * *', 'SELECT clean_old_notifications();'); 