-- ==============================================================================
-- Portfolio Database Schema (Supabase / PostgreSQL)
-- ==============================================================================

-- 1. Side Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  tagline TEXT,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Full-Stack',
  tech_stack TEXT[] NOT NULL DEFAULT '{}',
  demo_url TEXT,
  github_url TEXT,
  image_url TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Certificates Showcase Table (Legacy / Optional)
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date TEXT NOT NULL,
  description TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tech Stack Categories Table
CREATE TABLE IF NOT EXISTS tech_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon_name TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0
);

-- 3. Tech Stack Skills Table
CREATE TABLE IF NOT EXISTS tech_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES tech_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0
);

-- 4. Resume Metadata Table
CREATE TABLE IF NOT EXISTS resume_meta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_meta ENABLE ROW LEVEL SECURITY;

-- 6. Public Read Policies
CREATE POLICY "Public read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Public read certificates" ON certificates FOR SELECT USING (true);
CREATE POLICY "Public read tech_categories" ON tech_categories FOR SELECT USING (true);
CREATE POLICY "Public read tech_skills" ON tech_skills FOR SELECT USING (true);
CREATE POLICY "Public read resume_meta" ON resume_meta FOR SELECT USING (true);

-- 7. Public/Authenticated Write Policies
CREATE POLICY "Allow insert projects" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update projects" ON projects FOR UPDATE USING (true);
CREATE POLICY "Allow delete projects" ON projects FOR DELETE USING (true);

CREATE POLICY "Allow insert certificates" ON certificates FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update certificates" ON certificates FOR UPDATE USING (true);
CREATE POLICY "Allow delete certificates" ON certificates FOR DELETE USING (true);

CREATE POLICY "Allow insert resume_meta" ON resume_meta FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update resume_meta" ON resume_meta FOR UPDATE USING (true);

-- 8. Storage bucket for resumes
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public access to resumes" ON storage.objects
  FOR SELECT USING (bucket_id = 'resumes');

CREATE POLICY "Allow uploads to resumes" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Allow updates to resumes" ON storage.objects
  FOR UPDATE USING (bucket_id = 'resumes');
