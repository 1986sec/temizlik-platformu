/*
  # Enum Type Hatalarını Düzelt

  1. Mevcut Durumu Kontrol Et
    - Var olan enum tiplerini kontrol et
    - Sadece eksik olanları oluştur

  2. Güvenli Oluşturma
    - IF NOT EXISTS mantığı ile güvenli oluşturma
    - Hata durumunda devam etme

  3. Tablolar ve Policies
    - Tüm tabloları güvenli şekilde oluştur
    - RLS policy'lerini yeniden oluştur
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Safely create enum types only if they don't exist
DO $$ 
BEGIN
    -- Check and create user_type enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type') THEN
        CREATE TYPE user_type AS ENUM ('job_seeker', 'employer', 'admin');
    END IF;

    -- Check and create job_type enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_type') THEN
        CREATE TYPE job_type AS ENUM ('full_time', 'part_time', 'contract', 'temporary');
    END IF;

    -- Check and create application_status enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_status') THEN
        CREATE TYPE application_status AS ENUM ('pending', 'reviewed', 'shortlisted', 'accepted', 'rejected');
    END IF;

    -- Check and create job_status enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status') THEN
        CREATE TYPE job_status AS ENUM ('draft', 'pending', 'active', 'paused', 'expired', 'filled');
    END IF;

    -- Check and create report_status enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_status') THEN
        CREATE TYPE report_status AS ENUM ('pending', 'investigating', 'resolved', 'dismissed');
    END IF;

    -- Check and create notification_type enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM ('application', 'job_match', 'message', 'system');
    END IF;
END $$;

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type user_type NOT NULL DEFAULT 'job_seeker',
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  city text,
  avatar_url text,
  bio text,
  experience_years integer DEFAULT 0,
  hourly_rate numeric(10,2),
  is_premium boolean DEFAULT false,
  premium_expires_at timestamptz,
  is_verified boolean DEFAULT false,
  is_active boolean DEFAULT true,
  last_seen_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  website text,
  logo_url text,
  address text,
  city text NOT NULL,
  phone text,
  email text,
  tax_number text,
  employee_count text,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Job categories table
CREATE TABLE IF NOT EXISTS job_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Add unique constraint only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'job_categories_name_key'
    ) THEN
        ALTER TABLE job_categories ADD CONSTRAINT job_categories_name_key UNIQUE (name);
    END IF;
END $$;

-- Job postings table
CREATE TABLE IF NOT EXISTS job_postings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  category_id uuid REFERENCES job_categories(id),
  title text NOT NULL,
  description text NOT NULL,
  requirements text[],
  benefits text[],
  job_type job_type NOT NULL DEFAULT 'full_time',
  salary_min numeric(10,2),
  salary_max numeric(10,2),
  salary_currency text DEFAULT 'TL',
  city text NOT NULL,
  address text,
  location point,
  is_remote boolean DEFAULT false,
  is_urgent boolean DEFAULT false,
  is_premium boolean DEFAULT false,
  status job_status DEFAULT 'draft',
  expires_at timestamptz,
  view_count integer DEFAULT 0,
  application_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES job_postings(id) ON DELETE CASCADE,
  applicant_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  cover_letter text,
  resume_url text,
  status application_status DEFAULT 'pending',
  employer_notes text,
  applied_at timestamptz DEFAULT now(),
  reviewed_at timestamptz
);

-- Add unique constraint only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'applications_job_id_applicant_id_key'
    ) THEN
        ALTER TABLE applications ADD CONSTRAINT applications_job_id_applicant_id_key UNIQUE (job_id, applicant_id);
    END IF;
END $$;

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  job_id uuid REFERENCES job_postings(id) ON DELETE SET NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Add unique constraint only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'reviews_reviewer_id_reviewee_id_job_id_key'
    ) THEN
        ALTER TABLE reviews ADD CONSTRAINT reviews_reviewer_id_reviewee_id_job_id_key UNIQUE (reviewer_id, reviewee_id, job_id);
    END IF;
END $$;

-- Saved jobs table
CREATE TABLE IF NOT EXISTS saved_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  job_id uuid REFERENCES job_postings(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Add unique constraint only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'saved_jobs_user_id_job_id_key'
    ) THEN
        ALTER TABLE saved_jobs ADD CONSTRAINT saved_jobs_user_id_job_id_key UNIQUE (user_id, job_id);
    END IF;
END $$;

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  reported_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  reported_job_id uuid REFERENCES job_postings(id) ON DELETE CASCADE,
  reason text NOT NULL,
  description text,
  status report_status DEFAULT 'pending',
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Insert default job categories only if they don't exist
INSERT INTO job_categories (name, description, icon) 
SELECT * FROM (VALUES
  ('Ev Temizliği', 'Ev ve konut temizlik hizmetleri', 'home'),
  ('Ofis Temizliği', 'Ofis ve iş yeri temizlik hizmetleri', 'building'),
  ('Endüstriyel Temizlik', 'Fabrika ve endüstriyel alan temizliği', 'factory'),
  ('Hastane Temizliği', 'Sağlık kuruluşları temizlik hizmetleri', 'hospital'),
  ('Otel Temizliği', 'Otel ve konaklama tesisleri temizliği', 'hotel'),
  ('Cam Temizliği', 'Cam ve vitrin temizlik hizmetleri', 'glass'),
  ('Halı Temizliği', 'Halı ve döşeme temizlik hizmetleri', 'carpet'),
  ('Genel Temizlik', 'Diğer temizlik hizmetleri', 'cleaning')
) AS t(name, description, icon)
WHERE NOT EXISTS (SELECT 1 FROM job_categories WHERE name = t.name);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Safely drop and recreate policies
DO $$
BEGIN
    -- Profiles policies
    DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
    DROP POLICY IF EXISTS "Trigger can insert profiles" ON profiles;

    CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
    CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
    CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
    -- Allow trigger function to insert profiles (for new user registration)
    CREATE POLICY "Trigger can insert profiles" ON profiles FOR INSERT WITH CHECK (true);

    -- Companies policies
    DROP POLICY IF EXISTS "Anyone can view active companies" ON companies;
    DROP POLICY IF EXISTS "Employers can manage own companies" ON companies;

    CREATE POLICY "Anyone can view active companies" ON companies FOR SELECT USING (true);
    CREATE POLICY "Employers can manage own companies" ON companies FOR ALL USING (auth.uid() = owner_id);

    -- Job categories policies
    DROP POLICY IF EXISTS "Anyone can view job categories" ON job_categories;
    CREATE POLICY "Anyone can view job categories" ON job_categories FOR SELECT USING (is_active = true);

    -- Job postings policies
    DROP POLICY IF EXISTS "Anyone can view active job postings" ON job_postings;
    DROP POLICY IF EXISTS "Employers can manage own job postings" ON job_postings;

    CREATE POLICY "Anyone can view active job postings" ON job_postings FOR SELECT USING (status = 'active');
    CREATE POLICY "Employers can manage own job postings" ON job_postings FOR ALL USING (auth.uid() = employer_id);

    -- Applications policies
    DROP POLICY IF EXISTS "Job seekers can view own applications" ON applications;
    DROP POLICY IF EXISTS "Employers can view applications for own jobs" ON applications;
    DROP POLICY IF EXISTS "Job seekers can create applications" ON applications;
    DROP POLICY IF EXISTS "Employers can update applications for own jobs" ON applications;

    CREATE POLICY "Job seekers can view own applications" ON applications FOR SELECT USING (auth.uid() = applicant_id);
    CREATE POLICY "Employers can view applications for own jobs" ON applications FOR SELECT USING (
      EXISTS (SELECT 1 FROM job_postings WHERE id = job_id AND employer_id = auth.uid())
    );
    CREATE POLICY "Job seekers can create applications" ON applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);
    CREATE POLICY "Employers can update applications for own jobs" ON applications FOR UPDATE USING (
      EXISTS (SELECT 1 FROM job_postings WHERE id = job_id AND employer_id = auth.uid())
    );

    -- Reviews policies
    DROP POLICY IF EXISTS "Anyone can view public reviews" ON reviews;
    DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
    DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;

    CREATE POLICY "Anyone can view public reviews" ON reviews FOR SELECT USING (is_public = true);
    CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
    CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = reviewer_id);

    -- Saved jobs policies
    DROP POLICY IF EXISTS "Users can manage own saved jobs" ON saved_jobs;
    CREATE POLICY "Users can manage own saved jobs" ON saved_jobs FOR ALL USING (auth.uid() = user_id);

    -- Notifications policies
    DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
    DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

    CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

    -- Reports policies
    DROP POLICY IF EXISTS "Users can create reports" ON reports;
    DROP POLICY IF EXISTS "Users can view own reports" ON reports;

    CREATE POLICY "Users can create reports" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
    CREATE POLICY "Users can view own reports" ON reports FOR SELECT USING (auth.uid() = reporter_id);
END $$;

-- Create indexes for performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON profiles(is_premium);

CREATE INDEX IF NOT EXISTS idx_companies_city ON companies(city);
CREATE INDEX IF NOT EXISTS idx_companies_owner_id ON companies(owner_id);

CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_postings_city ON job_postings(city);
CREATE INDEX IF NOT EXISTS idx_job_postings_category_id ON job_postings(category_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_employer_id ON job_postings(employer_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_created_at ON job_postings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_postings_is_premium ON job_postings(is_premium);
CREATE INDEX IF NOT EXISTS idx_job_postings_location ON job_postings USING GIST(location);

CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant_id ON applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Create full-text search index for job postings
CREATE INDEX IF NOT EXISTS idx_job_postings_search ON job_postings USING gin(to_tsvector('turkish', title || ' ' || description));

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Safely create triggers
DO $$
BEGIN
    -- Drop existing triggers if they exist
    DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
    DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
    DROP TRIGGER IF EXISTS update_job_postings_updated_at ON job_postings;

    -- Create triggers for updated_at
    CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_job_postings_updated_at BEFORE UPDATE ON job_postings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END $$;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Add error handling and logging
  BEGIN
    INSERT INTO public.profiles (id, first_name, last_name, user_type, phone, city)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'first_name', ''),
      COALESCE(new.raw_user_meta_data->>'last_name', ''),
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
        COALESCE(new.raw_user_meta_data->>'first_name', 'User'),
        COALESCE(new.raw_user_meta_data->>'last_name', 'User'),
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

-- Safely create trigger for new user registration
DO $$
BEGIN
    -- Drop existing trigger if it exists
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

    -- Create trigger for new user registration
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
END $$;