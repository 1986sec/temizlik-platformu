-- Email verification system
-- Add email verification fields to profiles table
ALTER TABLE profiles 
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN email_verification_token TEXT,
ADD COLUMN email_verification_expires_at TIMESTAMP WITH TIME ZONE;

-- Create email verification tokens table
CREATE TABLE email_verification_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE
);

-- Create password reset tokens table
CREATE TABLE password_reset_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE
);

-- Add RLS policies for email verification tokens
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own verification tokens" ON email_verification_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own verification tokens" ON email_verification_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own verification tokens" ON email_verification_tokens
  FOR UPDATE USING (auth.uid() = user_id);

-- Add RLS policies for password reset tokens
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reset tokens" ON password_reset_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reset tokens" ON password_reset_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reset tokens" ON password_reset_tokens
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to clean up expired tokens
CREATE OR REPLACE FUNCTION clean_expired_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM email_verification_tokens WHERE expires_at < NOW();
  DELETE FROM password_reset_tokens WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a cron job to clean expired tokens (runs every hour)
SELECT cron.schedule('clean-expired-tokens', '0 * * * *', 'SELECT clean_expired_tokens();'); 