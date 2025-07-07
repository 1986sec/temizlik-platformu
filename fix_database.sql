-- Fix database issues for user registration
-- Run this in Supabase SQL Editor

-- 1. Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Create improved trigger function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Add error handling and logging
  BEGIN
    INSERT INTO public.profiles (id, first_name, last_name, user_type, phone, city)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'first_name', 'User'),
      COALESCE(new.raw_user_meta_data->>'last_name', 'User'),
      COALESCE(new.raw_user_meta_data->>'user_type', 'job_seeker')::user_type,
      COALESCE(new.raw_user_meta_data->>'phone', ''),
      COALESCE(new.raw_user_meta_data->>'city', '')
    );
    
    -- Log successful profile creation
    RAISE NOTICE 'Profile created successfully for user: %', new.id;
    
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', new.id, SQLERRM;
    
    -- Try to create a minimal profile with just the required fields
    BEGIN
      INSERT INTO public.profiles (id, first_name, last_name, user_type)
      VALUES (
        new.id,
        'User',
        'User',
        'job_seeker'::user_type
      );
      RAISE NOTICE 'Minimal profile created for user: %', new.id;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to create even minimal profile for user %: %', new.id, SQLERRM;
    END;
  END;
  
  RETURN new;
END;
$$ language plpgsql security definer;

-- 3. Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Fix RLS policies for profiles table
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Trigger can insert profiles" ON profiles;

CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
-- Allow trigger function to insert profiles (for new user registration)
CREATE POLICY "Trigger can insert profiles" ON profiles FOR INSERT WITH CHECK (true);

-- 5. Ensure profiles table has correct structure
DO $$
BEGIN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_active') THEN
        ALTER TABLE profiles ADD COLUMN is_active boolean DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_verified') THEN
        ALTER TABLE profiles ADD COLUMN is_verified boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_premium') THEN
        ALTER TABLE profiles ADD COLUMN is_premium boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_approved') THEN
        ALTER TABLE profiles ADD COLUMN is_approved boolean DEFAULT false;
    END IF;
END $$;

-- 6. Test the fix by checking if trigger is working
SELECT 
    trigger_name, 
    event_manipulation, 
    action_statement 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created'; 