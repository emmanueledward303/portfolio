import fs from 'fs';
import path from 'path';
import { supabase, isSupabaseConfigured } from './supabase';
import {
  resolveGitHubToken,
  fetchFileFromGitHub,
  commitFileToGitHub,
} from './githubSync';

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

export interface AboutFact {
  label: string;
  value: string;
}

export interface AboutData {
  eyebrow?: string;
  heading: string;
  paragraphs: string[];
  facts: AboutFact[];
  image_url?: string;
  profile_image_url?: string;
}

// ---------------------------------------------------------------------------
// In-Memory Runtime Cache & Seed Defaults
// ---------------------------------------------------------------------------

const defaultProjects: Project[] = [
  {
    id: 'proj-1',
    title: 'Retail Sales & Inventory Forecasting Engine',
    tagline: 'Predictive analytics & inventory optimization',
    description:
      'An end-to-end data analytics platform utilizing historical retail records to forecast stock requirements, identify sales trends, and minimize stockouts with automated reporting.',
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
    description:
      'A scalable task management and asynchronous notification platform built with Next.js App Router and relational storage, with role-based access control and analytics dashboards.',
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
    description:
      'Clean automated pipeline that digests multi-source financial statements, normalizes categorical spending, and delivers clear interactive summaries for business decision makers.',
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
    description:
      'Hands-on training in SQL, spreadsheets, data visualization (Tableau), and R/Python data processing.',
  },
  {
    id: 'cert-2',
    title: 'Full-Stack Web Development',
    issuer: 'Meta',
    issue_date: '2023',
    description:
      'Comprehensive software engineering program covering React, modern JavaScript, API design, and version control.',
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

// Runtime in-memory caches to guarantee instant consistency across the app
let cachedProjects: Project[] | null = null;
let cachedProjectsTime = 0;

let cachedBlogPosts: BlogPost[] | null = null;
let cachedBlogPostsTime = 0;

const CACHE_TTL_MS = 60 * 1000; // 1 minute fresh TTL before re-checking GitHub

// ---------------------------------------------------------------------------
// File-System Helpers (for local development & bundled fallback)
// ---------------------------------------------------------------------------

const DATA_DIR = path.join(process.cwd(), 'data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const BLOG_FILE = path.join(DATA_DIR, 'blog_posts.json');
const RESUME_FILE = path.join(DATA_DIR, 'resume.json');

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    // Expected on read-only environments like Vercel
  }
}

function readProjectsFromFile(): Project[] {
  try {
    ensureDataDir();
    if (fs.existsSync(PROJECTS_FILE)) {
      const raw = fs.readFileSync(PROJECTS_FILE, 'utf-8');
      if (raw.trim()) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    }
  } catch (err) {
    console.warn('readProjectsFromFile notice:', err);
  }
  return [...defaultProjects];
}

function writeProjectsToFile(projects: Project[]): boolean {
  try {
    ensureDataDir();
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8');
    return true;
  } catch (err) {
    // Expected on read-only serverless lambdas (Vercel)
    return false;
  }
}

function readBlogPostsFromFile(): BlogPost[] {
  try {
    ensureDataDir();
    if (fs.existsSync(BLOG_FILE)) {
      const raw = fs.readFileSync(BLOG_FILE, 'utf-8');
      if (raw.trim()) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    }
  } catch (err) {
    console.warn('readBlogPostsFromFile notice:', err);
  }
  return [...defaultBlogPosts];
}

function writeBlogPostsToFile(posts: BlogPost[]): boolean {
  try {
    ensureDataDir();
    fs.writeFileSync(BLOG_FILE, JSON.stringify(posts, null, 2), 'utf-8');
    return true;
  } catch (err) {
    return false;
  }
}

function readResumeFromFile(): ResumeMeta {
  try {
    ensureDataDir();
    if (fs.existsSync(RESUME_FILE)) {
      const raw = fs.readFileSync(RESUME_FILE, 'utf-8');
      if (raw.trim()) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.file_url) return parsed;
      }
    }
  } catch (err) {
    console.warn('readResumeFromFile notice:', err);
  }
  return {
    file_url: '/resume.pdf',
    file_name: 'Edward_Emmanuel_Resume.pdf',
    last_updated: 'Current',
  };
}

function writeResumeToFile(meta: ResumeMeta): boolean {
  try {
    ensureDataDir();
    fs.writeFileSync(RESUME_FILE, JSON.stringify(meta, null, 2), 'utf-8');
    return true;
  } catch (err) {
    return false;
  }
}

const inMemoryCertificates: Certificate[] = [...defaultCertificates];

let runtimeResumeMeta: ResumeMeta = readResumeFromFile();
let runtimeResumeBuffer: Buffer | null = null;

export function setRuntimeResumeBuffer(buf: Buffer): void {
  runtimeResumeBuffer = buf;
}

export function getRuntimeResumeBuffer(): Buffer | null {
  return runtimeResumeBuffer;
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export async function getProjects(req?: Request): Promise<Project[]> {
  // 1. If Supabase is configured, use Supabase
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      cachedProjects = data;
      cachedProjectsTime = Date.now();
      return data;
    }
  }

  // 2. Return in-memory cache if still fresh
  const now = Date.now();
  if (cachedProjects && now - cachedProjectsTime < CACHE_TTL_MS) {
    return cachedProjects;
  }

  // 3. Attempt to fetch latest from GitHub repository
  const token = await resolveGitHubToken(req);
  const githubResult = await fetchFileFromGitHub<Project[]>('data/projects.json', token);
  if (githubResult?.data && Array.isArray(githubResult.data) && githubResult.data.length > 0) {
    cachedProjects = githubResult.data;
    cachedProjectsTime = now;
    return githubResult.data;
  }

  // 4. Fallback to local file bundled in repository
  const localProjects = readProjectsFromFile();
  cachedProjects = localProjects;
  cachedProjectsTime = now;
  return localProjects;
}

export async function createProject(
  project: Omit<Project, 'id' | 'created_at'>,
  req?: Request
): Promise<Project> {
  const token = await resolveGitHubToken(req);
  const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

  // 1. Supabase Persistence
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select()
      .single();
    if (error) throw new Error(error.message);

    // Also commit to GitHub if token is present for full repo sync
    if (token) {
      try {
        const allProjects = await getProjects(req);
        const updatedList = [data, ...allProjects.filter((p) => p.id !== data.id)];
        await commitFileToGitHub(
          'data/projects.json',
          JSON.stringify(updatedList, null, 2),
          `feat(portfolio): add project "${data.title}" from admin portal`,
          token
        );
      } catch (ghErr) {
        console.warn('GitHub auto-commit after Supabase insert warning:', ghErr);
      }
    }

    cachedProjects = null; // Invalidate cache
    return data;
  }

  // 2. Prepare new project item
  const currentProjects = await getProjects(req);
  const newProject: Project = {
    id: `proj-${Date.now()}`,
    created_at: new Date().toISOString(),
    ...project,
  };
  const updatedProjects = [newProject, ...currentProjects];

  // Update in-memory cache immediately so this session and concurrent requests see it
  cachedProjects = updatedProjects;
  cachedProjectsTime = Date.now();

  // Try writing to local file (succeeds in dev or persistent server environments)
  const wroteLocal = writeProjectsToFile(updatedProjects);

  // 3. GitHub Auto-Commit (Essential for Vercel / Online Persistence)
  if (token) {
    const commitResult = await commitFileToGitHub(
      'data/projects.json',
      JSON.stringify(updatedProjects, null, 2),
      `feat(portfolio): add project "${newProject.title}" from admin portal`,
      token
    );

    if (!commitResult.success) {
      console.error('GitHub auto-commit failed:', commitResult.error);
      throw new Error(`Failed to commit project to GitHub: ${commitResult.error}`);
    }

    return newProject;
  }

  // If in production on Vercel and neither Supabase nor GitHub Token is active, alert the user
  if (isProd && !wroteLocal) {
    throw new Error(
      'Online persistence required: Please connect GitHub Auto-Commit (add GITHUB_TOKEN in Admin Settings or Vercel) or connect Supabase so your projects commit and stay permanently.'
    );
  }

  return newProject;
}

export async function updateProject(
  id: string,
  project: Partial<Omit<Project, 'id' | 'created_at'>>,
  req?: Request
): Promise<Project | null> {
  const token = await resolveGitHubToken(req);
  const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

  // 1. Supabase Persistence
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

    if (token && data) {
      try {
        const all = await getProjects(req);
        const updated = all.map((p) => (p.id === id ? data : p));
        await commitFileToGitHub(
          'data/projects.json',
          JSON.stringify(updated, null, 2),
          `chore(portfolio): update project "${data.title}" from admin portal`,
          token
        );
      } catch (ghErr) {
        console.warn('GitHub auto-commit warning:', ghErr);
      }
    }

    cachedProjects = null;
    return data;
  }

  // 2. In-memory & GitHub Persistence
  const currentProjects = await getProjects(req);
  const targetId = String(id).trim();
  const idx = currentProjects.findIndex((p) => String(p.id).trim() === targetId);
  if (idx === -1) return null;

  const updatedItem: Project = {
    ...currentProjects[idx],
    ...project,
  };
  currentProjects[idx] = updatedItem;

  cachedProjects = [...currentProjects];
  cachedProjectsTime = Date.now();

  const wroteLocal = writeProjectsToFile(currentProjects);

  if (token) {
    const commitResult = await commitFileToGitHub(
      'data/projects.json',
      JSON.stringify(currentProjects, null, 2),
      `chore(portfolio): update project "${updatedItem.title}" from admin portal`,
      token
    );

    if (!commitResult.success) {
      throw new Error(`Failed to commit update to GitHub: ${commitResult.error}`);
    }
  } else if (isProd && !wroteLocal) {
    throw new Error(
      'Online persistence required: Please configure GITHUB_TOKEN or Supabase to persist edits online.'
    );
  }

  return updatedItem;
}

export async function deleteProject(
  id: string,
  req?: Request
): Promise<{ success: boolean; error?: string }> {
  if (!id) {
    return { success: false, error: 'Project ID is required' };
  }

  const token = await resolveGitHubToken(req);
  const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

  // 1. Supabase Persistence
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) {
      console.error('deleteProject error:', error.message);
      return { success: false, error: error.message };
    }

    if (token) {
      try {
        const all = await getProjects(req);
        const remaining = all.filter((p) => p.id !== id);
        await commitFileToGitHub(
          'data/projects.json',
          JSON.stringify(remaining, null, 2),
          `chore(portfolio): delete project from admin portal`,
          token
        );
      } catch (ghErr) {
        console.warn('GitHub auto-commit warning:', ghErr);
      }
    }

    cachedProjects = null;
    return { success: true };
  }

  // 2. In-memory & GitHub Persistence
  const currentProjects = await getProjects(req);
  const targetId = String(id).trim();
  const idx = currentProjects.findIndex((p) => String(p.id).trim() === targetId);
  if (idx === -1) {
    return { success: false, error: `Project not found with ID "${id}"` };
  }

  const removedTitle = currentProjects[idx].title;
  currentProjects.splice(idx, 1);

  cachedProjects = [...currentProjects];
  cachedProjectsTime = Date.now();

  const wroteLocal = writeProjectsToFile(currentProjects);

  if (token) {
    const commitResult = await commitFileToGitHub(
      'data/projects.json',
      JSON.stringify(currentProjects, null, 2),
      `chore(portfolio): delete project "${removedTitle}" from admin portal`,
      token
    );

    if (!commitResult.success) {
      return { success: false, error: `Failed to commit deletion to GitHub: ${commitResult.error}` };
    }
  } else if (isProd && !wroteLocal) {
    return {
      success: false,
      error: 'Online persistence required: Please configure GITHUB_TOKEN or Supabase to persist deletions online.',
    };
  }

  return { success: true };
}

// ---------------------------------------------------------------------------
// Blog Posts
// ---------------------------------------------------------------------------

export async function getBlogPosts(req?: Request): Promise<BlogPost[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      cachedBlogPosts = data;
      cachedBlogPostsTime = Date.now();
      return data;
    }
  }

  const now = Date.now();
  if (cachedBlogPosts && now - cachedBlogPostsTime < CACHE_TTL_MS) {
    return cachedBlogPosts;
  }

  const token = await resolveGitHubToken(req);
  const githubResult = await fetchFileFromGitHub<BlogPost[]>('data/blog_posts.json', token);
  if (githubResult?.data && Array.isArray(githubResult.data) && githubResult.data.length > 0) {
    cachedBlogPosts = githubResult.data;
    cachedBlogPostsTime = now;
    return githubResult.data;
  }

  const localPosts = readBlogPostsFromFile();
  cachedBlogPosts = localPosts;
  cachedBlogPostsTime = now;
  return localPosts;
}

export async function createBlogPost(
  post: Omit<BlogPost, 'id' | 'created_at'>,
  req?: Request
): Promise<BlogPost> {
  const token = await resolveGitHubToken(req);
  const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([post])
      .select()
      .single();
    if (error) throw new Error(error.message);

    if (token) {
      try {
        const all = await getBlogPosts(req);
        const updated = [data, ...all.filter((p) => p.id !== data.id)];
        await commitFileToGitHub(
          'data/blog_posts.json',
          JSON.stringify(updated, null, 2),
          `feat(blog): publish article "${data.title}" from admin portal`,
          token
        );
      } catch (ghErr) {
        console.warn('GitHub auto-commit warning:', ghErr);
      }
    }

    cachedBlogPosts = null;
    return data;
  }

  const currentPosts = await getBlogPosts(req);
  const newPost: BlogPost = {
    id: `post-${Date.now()}`,
    created_at: new Date().toISOString(),
    ...post,
  };
  const updatedPosts = [newPost, ...currentPosts];

  cachedBlogPosts = updatedPosts;
  cachedBlogPostsTime = Date.now();

  const wroteLocal = writeBlogPostsToFile(updatedPosts);

  if (token) {
    const commitResult = await commitFileToGitHub(
      'data/blog_posts.json',
      JSON.stringify(updatedPosts, null, 2),
      `feat(blog): publish article "${newPost.title}" from admin portal`,
      token
    );

    if (!commitResult.success) {
      throw new Error(`Failed to commit article to GitHub: ${commitResult.error}`);
    }
  } else if (isProd && !wroteLocal) {
    throw new Error(
      'Online persistence required: Please configure GITHUB_TOKEN or Supabase to persist blog posts online.'
    );
  }

  return newPost;
}

export async function deleteBlogPost(
  id: string,
  req?: Request
): Promise<{ success: boolean; error?: string }> {
  if (!id) return { success: false, error: 'Post ID is required' };

  const token = await resolveGitHubToken(req);
  const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) return { success: false, error: error.message };

    if (token) {
      try {
        const all = await getBlogPosts(req);
        const remaining = all.filter((p) => p.id !== id);
        await commitFileToGitHub(
          'data/blog_posts.json',
          JSON.stringify(remaining, null, 2),
          `chore(blog): delete article from admin portal`,
          token
        );
      } catch (ghErr) {
        console.warn('GitHub auto-commit warning:', ghErr);
      }
    }

    cachedBlogPosts = null;
    return { success: true };
  }

  const currentPosts = await getBlogPosts(req);
  const idx = currentPosts.findIndex((p) => p.id === id);
  if (idx === -1) return { success: false, error: `Post not found with ID "${id}"` };

  const removedTitle = currentPosts[idx].title;
  currentPosts.splice(idx, 1);

  cachedBlogPosts = [...currentPosts];
  cachedBlogPostsTime = Date.now();

  const wroteLocal = writeBlogPostsToFile(currentPosts);

  if (token) {
    const commitResult = await commitFileToGitHub(
      'data/blog_posts.json',
      JSON.stringify(currentPosts, null, 2),
      `chore(blog): delete article "${removedTitle}" from admin portal`,
      token
    );

    if (!commitResult.success) {
      return { success: false, error: `Failed to commit deletion to GitHub: ${commitResult.error}` };
    }
  } else if (isProd && !wroteLocal) {
    return {
      success: false,
      error: 'Online persistence required: Please configure GITHUB_TOKEN or Supabase to persist deletions online.',
    };
  }

  return { success: true };
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

export async function getResumeMeta(req?: Request): Promise<ResumeMeta> {
  // 1. If Supabase is configured, try Supabase safely
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('resume_meta')
        .select('file_url, file_name, last_updated')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (!error && data) {
        runtimeResumeMeta = data as ResumeMeta;
        writeResumeToFile(runtimeResumeMeta);
        return runtimeResumeMeta;
      }
    } catch (e) {
      console.warn('Supabase getResumeMeta notice:', e);
    }
  }

  // 2. Try GitHub sync if token available
  const token = await resolveGitHubToken(req);
  if (token) {
    try {
      const ghRes = await fetchFileFromGitHub<ResumeMeta>('data/resume.json', token);
      if (ghRes?.data?.file_url) {
        runtimeResumeMeta = ghRes.data;
        writeResumeToFile(runtimeResumeMeta);
        return runtimeResumeMeta;
      }
    } catch (e) {
      console.warn('GitHub getResumeMeta notice:', e);
    }
  }

  // 3. Fallback to local file or memory
  const fileMeta = readResumeFromFile();
  runtimeResumeMeta = { ...runtimeResumeMeta, ...fileMeta };
  return runtimeResumeMeta;
}

export async function setRuntimeResumeMeta(meta: ResumeMeta): Promise<ResumeMeta> {
  runtimeResumeMeta = { ...runtimeResumeMeta, ...meta };
  writeResumeToFile(runtimeResumeMeta);
  return runtimeResumeMeta;
}

// ---------------------------------------------------------------------------
// About Me Content
// ---------------------------------------------------------------------------

const defaultAboutData: AboutData = {
  eyebrow: 'About Me',
  heading: 'Building at the intersection of data & code.',
  paragraphs: [
    "I'm Edward Emmanuel, self-taught data analyst and software engineer. I don't just clean datasets I turn them into dashboards, scoring models, and apps people open more than once.",
    "My background spans Python data pipelines, BI tools, Excel, SQL analytics and full-stack web development with React and Next.js. I care deeply about clear communication, honest metrics, and well-crafted interfaces.",
    "Off the keyboard, you'll find me gaming, watching movies, or lost in whatever internet rabbit hole caught me that week.",
  ],
  facts: [
    { label: 'Based in', value: 'Nigeria' },
    { label: 'Work preference', value: 'Remote & Hybrid' },
    { label: 'To opportunities', value: 'Open' },
  ],
  image_url: '/about.jpg',
  profile_image_url: '/profile.jpg',
};

const ABOUT_DATA_FILE = path.join(process.cwd(), 'data', 'about.json');
let inMemoryAboutData: AboutData = defaultAboutData;

export async function getAboutData(): Promise<AboutData> {
  try {
    if (fs.existsSync(ABOUT_DATA_FILE)) {
      const content = fs.readFileSync(ABOUT_DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && parsed.heading) {
        inMemoryAboutData = parsed;
        return inMemoryAboutData;
      }
    }
  } catch (err) {
    console.error('Error reading about.json:', err);
  }
  return inMemoryAboutData;
}

export async function updateAboutData(data: Partial<AboutData>, req?: Request): Promise<AboutData> {
  const current = await getAboutData();
  const updated: AboutData = {
    eyebrow: data.eyebrow || current.eyebrow || 'About Me',
    heading: data.heading || current.heading,
    paragraphs:
      Array.isArray(data.paragraphs) && data.paragraphs.length > 0
        ? data.paragraphs
        : current.paragraphs,
    facts:
      Array.isArray(data.facts) && data.facts.length > 0
        ? data.facts
        : current.facts,
    image_url: data.image_url !== undefined ? data.image_url : (current.image_url || '/about.jpg'),
    profile_image_url: data.profile_image_url !== undefined ? data.profile_image_url : (current.profile_image_url || '/profile.jpg'),
  };

  inMemoryAboutData = updated;

  // 1. Local filesystem write
  try {
    const dir = path.dirname(ABOUT_DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ABOUT_DATA_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write to local about.json (serverless filesystem):', err);
  }

  // 2. Commit to GitHub if token available
  const githubToken = await resolveGitHubToken(req);
  if (githubToken) {
    try {
      await commitFileToGitHub(
        'data/about.json',
        JSON.stringify(updated, null, 2),
        'update: about me profile content',
        githubToken
      );
      console.log('Successfully committed updated data/about.json to GitHub');
    } catch (err) {
      console.error('Failed to commit about.json to GitHub:', err);
    }
  }

  return updated;
}
