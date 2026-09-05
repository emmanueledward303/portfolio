-- ==============================================================================
-- Portfolio Seed Data (Supabase / PostgreSQL)
-- ==============================================================================

-- 1. Seed Certificates
INSERT INTO certificates (title, issuer, issue_date, description, display_order)
VALUES
  ('AWS Solutions Architect', 'Amazon Web Services', 'Oct 2023', 'Demonstrated expertise in designing distributed systems and deploying scalable, highly available applications on AWS.', 1),
  ('Professional Data Engineer', 'Google Cloud', 'Mar 2023', 'Certified in designing and building data processing systems, with a focus on reliability, security, and performance.', 2),
  ('Meta React Developer', 'Meta / Coursera', 'Nov 2022', 'Completed advanced coursework in React application architecture, hooks, performance optimisation, and testing.', 3),
  ('PostgreSQL Advanced', 'EDB Training', 'Jul 2022', 'Covered query optimisation, indexing strategies, partitioning, and high-availability configurations for PostgreSQL.', 4),
  ('Docker and Kubernetes', 'Linux Foundation', 'Jan 2022', 'Hands-on certification in containerisation, orchestration, and deploying production workloads on Kubernetes clusters.', 5),
  ('Certified Scrum Master', 'Scrum Alliance', 'Sep 2021', 'Certified in Agile principles and the Scrum framework, with practical experience facilitating cross-functional delivery teams.', 6)
ON CONFLICT DO NOTHING;

-- 2. Seed Tech Categories and Skills
DO $$
DECLARE
  v_frontend_id UUID;
  v_backend_id UUID;
  v_data_id UUID;
  v_tools_id UUID;
BEGIN
  -- Insert categories
  INSERT INTO tech_categories (name, slug, icon_name, display_order)
  VALUES ('Frontend', 'frontend', 'frontend', 1)
  RETURNING id INTO v_frontend_id;

  INSERT INTO tech_categories (name, slug, icon_name, display_order)
  VALUES ('Backend', 'backend', 'backend', 2)
  RETURNING id INTO v_backend_id;

  INSERT INTO tech_categories (name, slug, icon_name, display_order)
  VALUES ('Data', 'data', 'data', 3)
  RETURNING id INTO v_data_id;

  INSERT INTO tech_categories (name, slug, icon_name, display_order)
  VALUES ('Tools', 'tools', 'tools', 4)
  RETURNING id INTO v_tools_id;

  -- Insert skills for Frontend
  INSERT INTO tech_skills (category_id, name, display_order) VALUES
    (v_frontend_id, 'React', 1),
    (v_frontend_id, 'Next.js', 2),
    (v_frontend_id, 'TypeScript', 3),
    (v_frontend_id, 'CSS Modules', 4),
    (v_frontend_id, 'Framer Motion', 5),
    (v_frontend_id, 'Figma', 6);

  -- Insert skills for Backend
  INSERT INTO tech_skills (category_id, name, display_order) VALUES
    (v_backend_id, 'Node.js', 1),
    (v_backend_id, 'Python', 2),
    (v_backend_id, 'FastAPI', 3),
    (v_backend_id, 'PostgreSQL', 4),
    (v_backend_id, 'Redis', 5),
    (v_backend_id, 'GraphQL', 6);

  -- Insert skills for Data
  INSERT INTO tech_skills (category_id, name, display_order) VALUES
    (v_data_id, 'Apache Spark', 1),
    (v_data_id, 'dbt', 2),
    (v_data_id, 'Airflow', 3),
    (v_data_id, 'BigQuery', 4),
    (v_data_id, 'Kafka', 5),
    (v_data_id, 'Pandas', 6);

  -- Insert skills for Tools
  INSERT INTO tech_skills (category_id, name, display_order) VALUES
    (v_tools_id, 'Docker', 1),
    (v_tools_id, 'Kubernetes', 2),
    (v_tools_id, 'GitHub Actions', 3),
    (v_tools_id, 'Terraform', 4),
    (v_tools_id, 'AWS', 5),
    (v_tools_id, 'GCP', 6);
END $$;

-- 3. Seed Resume Metadata
INSERT INTO resume_meta (file_url, file_name, last_updated)
VALUES ('/resume.pdf', 'Edward_Emmanuel_Resume.pdf', NOW())
ON CONFLICT DO NOTHING;
