import fs from 'fs';
import path from 'path';
import { supabase, isSupabaseConfigured } from './supabase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Project {
  id: string;
  title: string;
  tagline?: string;
  description: string;
  category?: string;
  tech_stack?: string[];
  demo_url?: string;
  github_url?: string;
  image_url?: string;
  featured?: boolean;
  created_at?: string;
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issue_date: string;
  description?: string;
}

export interface ResumeMeta {
  file_url: string;
  file_name: string;
  last_updated: string;
}

export interface Skill {
  name: string;
}

export interface TechCategory {
  id: string;
  name: string;
  slug: string;
  icon_name: string;
  skills: Skill[];
}

// ---------------------------------------------------------------------------
// In-memory fallback stores (used when Supabase is not configured)
// ---------------------------------------------------------------------------

const defaultProjects: Project[] = [
  {
    id: 'proj-1',
    title: 'Retail Sales & Inventory Forecasting Engine',
    tagline: 'Predictive analytics & inventory optimization',
    description: 'An end-to-end data analytics platform utilizing historical retail records to forecast stock requirements, identify sales trends, and minimize stockouts with automated reporting.',
    category: 'Data Analytics',
    tech_stack: ['Python', 'PostgreSQL', 'Pandas', 'Next.js', 'FastAPI'],
    demo_url: 'https://github.com/emmanueledward303',
    github_url: 'https://github.com/emmanueledward303',
    featured: true,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'proj-2',
    title: 'Distributed Event & Task Management Hub',
    tagline: 'High-throughput full-stack system',
    description: 'A scalable task management and asynchronous notification platform built with Next.js App Router and relational storage, with role-based access control and analytics dashboards.',
    category: 'Full-Stack',
    tech_stack: ['Next.js', 'TypeScript', 'Node.js', 'Supabase', 'TailwindCSS'],
    demo_url: 'https://github.com/emmanueledward303',
    github_url: 'https://github.com/emmanueledward303',
    featured: true,
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    id: 'proj-3',
    title: 'Financial Health & Expense Tracking System',
    tagline: 'Automated data ingestion & visual analytics',
    description: 'Clean automated pipeline that digests multi-source financial statements, normalizes categorical spending, and delivers clear interactive summaries for business decision makers.',
    category: 'Data Engineering',
    tech_stack: ['Python', 'SQL', 'NumPy', 'Docker', 'Chart.js'],
    demo_url: 'https://github.com/emmanueledward303',
    github_url: 'https://github.com/emmanueledward303',
    featured: false,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
];

const defaultCertificates: Certificate[] = [
  {
    id: 'cert-1',
    title: 'Data Analytics Professional Certificate',
    issuer: 'Google',
    issue_date: '2024',
    description: 'Hands-on training in SQL, spreadsheets, data visualization (Tableau), and R/Python data processing.',
  },
  {
    id: 'cert-2',
    title: 'Full-Stack Web Development',
    issuer: 'Meta',
    issue_date: '2023',
    description: 'Comprehensive software engineering program covering React, modern JavaScript, API design, and version control.',
  },
];

const defaultTechCategories: TechCategory[] = [
  {
    id: 'cat-frontend',
    name: 'Frontend Engineering',
    slug: 'frontend',
    icon_name: 'FrontendIcon',
    skills: [
      { name: 'React' },
      { name: 'Next.js' },
      { name: 'TypeScript' },
      { name: 'JavaScript' },
      { name: 'TailwindCSS' },
      { name: 'HTML5 & CSS3' },
    ],
  },
  {
    id: 'cat-backend',
    name: 'Backend & Systems',
    slug: 'backend',
    icon_name: 'BackendIcon',
    skills: [
      { name: 'Node.js' },
      { name: 'Express' },
      { name: 'Python' },
      { name: 'REST APIs' },
      { name: 'PostgreSQL' },
      { name: 'Supabase' },
    ],
  },
  {
    id: 'cat-data',
    name: 'Data & Analytics',
    slug: 'data',
    icon_name: 'DataIcon',
    skills: [
      { name: 'SQL Analytics' },
      { name: 'Pandas' },
      { name: 'NumPy' },
      { name: 'Data Modeling' },
      { name: 'ETL Pipelines' },
      { name: 'Power BI' },
      { name: 'Excel' },
      { name: 'Jupyter Notebook' },
    ],
  },
  {
    id: 'cat-tools',
    name: 'Tools & DevOps',
    slug: 'tools',
    icon_name: 'ToolsIcon',
    skills: [
      { name: 'Git' },
      { name: 'GitHub' },
      { name: 'SQL Server Management Studio' },
      { name: 'Vercel' },
      { name: 'VS Code' },
      { name: 'Claude Code' },
    ],
  },
];

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  read_time: string;
  slug: string;
  created_at?: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const BLOG_FILE = path.join(DATA_DIR, 'blog_posts.json');

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('ensureDataDir error:', err);
  }
}

function readProjectsFromFile(): Project[] {
  try {
    ensureDataDir();
    if (fs.existsSync(PROJECTS_FILE)) {
      const raw = fs.readFileSync(PROJECTS_FILE, 'utf-8');
      if (raw.trim()) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } else {
      // First-time setup: write default projects to file
      writeProjectsToFile(defaultProjects);
      return [...defaultProjects];
    }
  } catch (err) {
    console.error('readProjectsFromFile error:', err);
  }
  return [...defaultProjects];
}

function writeProjectsToFile(projects: Project[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8');
  } catch (err) {
    console.error('writeProjectsToFile error:', err);
  }
}

const inMemoryCertificates: Certificate[] = [...defaultCertificates];

let runtimeResumeMeta: ResumeMeta = {
  file_url: '/resume.pdf',
  file_name: 'Edward_Emmanuel_Resume.pdf',
  last_updated: 'Current',
};

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export async function getProjects(): Promise<Project[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('getProjects error:', error.message);
      return readProjectsFromFile();
    }
    return data && data.length > 0 ? data : readProjectsFromFile();
  }
  return readProjectsFromFile();
}

export async function createProject(
  project: Omit<Project, 'id' | 'created_at'>
): Promise<Project> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }
  // File-backed persistent store
  const projects = readProjectsFromFile();
  const newProject: Project = {
    id: `proj-${Date.now()}`,
    created_at: new Date().toISOString(),
    ...project,
  };
  projects.unshift(newProject);
  writeProjectsToFile(projects);
  return newProject;
}

export async function deleteProject(id: string): Promise<{ success: boolean; error?: string }> {
  if (!id) {
    return { success: false, error: 'Project ID is required' };
  }

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) {
      console.error('deleteProject error:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  }

  // File-backed persistent store
  const projects = readProjectsFromFile();
  const targetId = String(id).trim();
  const idx = projects.findIndex((p) => String(p.id).trim() === targetId);
  if (idx === -1) {
    return { success: false, error: `Project not found with ID "${id}"` };
  }
  projects.splice(idx, 1);
  writeProjectsToFile(projects);
  return { success: true };
}

export async function updateProject(
  id: string,
  project: Partial<Omit<Project, 'id' | 'created_at'>>
): Promise<Project | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('projects')
      .update(project)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('updateProject error:', error.message);
      throw new Error(error.message);
    }
    return data;
  }

  // File-backed persistent store
  const projects = readProjectsFromFile();
  const targetId = String(id).trim();
  const idx = projects.findIndex((p) => String(p.id).trim() === targetId);
  if (idx === -1) return null;
  projects[idx] = {
    ...projects[idx],
    ...project,
  };
  writeProjectsToFile(projects);
  return projects[idx];
}

// ---------------------------------------------------------------------------
// Certificates
// ---------------------------------------------------------------------------

export async function getCertificates(): Promise<Certificate[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .order('issue_date', { ascending: false });
    if (error) {
      console.error('getCertificates error:', error.message);
      return inMemoryCertificates;
    }
    return data && data.length > 0 ? data : inMemoryCertificates;
  }
  return inMemoryCertificates;
}

// ---------------------------------------------------------------------------
// Tech Stack
// ---------------------------------------------------------------------------

export async function getTechStack(): Promise<TechCategory[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('tech_categories')
      .select('id, name, slug, icon_name, skills ( name )');
    if (error || !data || data.length === 0) {
      return defaultTechCategories;
    }
    return data as TechCategory[];
  }
  return defaultTechCategories;
}

// ---------------------------------------------------------------------------
// Resume Meta
// ---------------------------------------------------------------------------

export async function getResumeMeta(): Promise<ResumeMeta> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('resume_meta')
      .select('file_url, file_name, last_updated')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (error || !data) return runtimeResumeMeta;
    return data as ResumeMeta;
  }
  return runtimeResumeMeta;
}

export async function setRuntimeResumeMeta(meta: ResumeMeta): Promise<ResumeMeta> {
  runtimeResumeMeta = meta;
  return runtimeResumeMeta;
}

// ---------------------------------------------------------------------------
// Blog Posts (file-backed, same pattern as projects)
// ---------------------------------------------------------------------------

const defaultBlogPosts: BlogPost[] = [
  {
    id: 'post-1',
    title: 'Bridging Data Analytics with Scalable Web Systems',
    excerpt:
      'How treating data pipelines with software engineering rigor leads to more reliable business intelligence and faster decision-making.',
    content: `In modern tech teams, data analysis and software engineering often live in separate silos. Analysts work in SQL notebooks, while software engineers build production APIs and UIs.\n\nHowever, the real magic happens when data pipelines are treated with the exact same engineering standards: version-controlled schemas, automated validations, and clear API boundaries.\n\nBy designing responsive frontend dashboards connected directly to well-modeled data systems, we eliminate guesswork and give stakeholders confidence in every metric they see.`,
    date: 'August 2024',
    read_time: '4 min read',
    slug: 'bridging-data-analytics-with-scalable-web-systems',
    created_at: new Date('2024-08-01').toISOString(),
  },
];

function readBlogPostsFromFile(): BlogPost[] {
  try {
    ensureDataDir();
    if (fs.existsSync(BLOG_FILE)) {
      const raw = fs.readFileSync(BLOG_FILE, 'utf-8');
      if (raw.trim()) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } else {
      // First-time setup: seed default post
      writeBlogPostsToFile(defaultBlogPosts);
      return [...defaultBlogPosts];
    }
  } catch (err) {
    console.error('readBlogPostsFromFile error:', err);
  }
  return [...defaultBlogPosts];
}

function writeBlogPostsToFile(posts: BlogPost[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(BLOG_FILE, JSON.stringify(posts, null, 2), 'utf-8');
  } catch (err) {
    console.error('writeBlogPostsToFile error:', err);
  }
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('getBlogPosts error:', error.message);
      return readBlogPostsFromFile();
    }
    return data ?? [];
  }
  return readBlogPostsFromFile();
}

export async function createBlogPost(
  post: Omit<BlogPost, 'id' | 'created_at'>
): Promise<BlogPost> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([post])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }
  const posts = readBlogPostsFromFile();
  const newPost: BlogPost = {
    id: `post-${Date.now()}`,
    created_at: new Date().toISOString(),
    ...post,
  };
  posts.unshift(newPost);
  writeBlogPostsToFile(posts);
  return newPost;
}

export async function deleteBlogPost(id: string): Promise<{ success: boolean; error?: string }> {
  if (!id) return { success: false, error: 'Post ID is required' };

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  const posts = readBlogPostsFromFile();
  const idx = posts.findIndex((p) => p.id === id);
  if (idx === -1) return { success: false, error: `Post not found with ID "${id}"` };
  posts.splice(idx, 1);
  writeBlogPostsToFile(posts);
  return { success: true };
}
