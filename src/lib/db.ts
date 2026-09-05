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

const inMemoryProjects: Project[] = [...defaultProjects];
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
      return inMemoryProjects;
    }
    return data && data.length > 0 ? data : inMemoryProjects;
  }
  return inMemoryProjects;
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
  // In-memory fallback
  const newProject: Project = {
    id: `proj-${Date.now()}`,
    created_at: new Date().toISOString(),
    ...project,
  };
  inMemoryProjects.unshift(newProject);
  return newProject;
}

export async function deleteProject(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) {
      console.error('deleteProject error:', error.message);
      return false;
    }
    return true;
  }
  // In-memory fallback
  const idx = inMemoryProjects.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  inMemoryProjects.splice(idx, 1);
  return true;
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
  // In-memory fallback
  const idx = inMemoryProjects.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  inMemoryProjects[idx] = {
    ...inMemoryProjects[idx],
    ...project,
  };
  return inMemoryProjects[idx];
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
